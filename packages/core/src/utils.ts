import type { ZodObject } from 'zod';
import { z } from 'zod';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function jsonSchemaPropertiesToTSTypes(value: any): z.ZodTypeAny {
  if (!value.type) {
    return z.object({});
  }

  let zodType;
  switch (value.type) {
    case 'string':
      zodType = z
        .string()
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
      break;
    case 'number':
      zodType = z
        .number()
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
      break;
    case 'integer':
      zodType = z
        .number()
        .int()
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
      break;
    case 'boolean':
      zodType = z
        .boolean()
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
      break;
    case 'array':
      zodType = z
        .array(jsonSchemaPropertiesToTSTypes(value.items))
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
      break;
    case 'object':
      zodType = jsonSchemaToModel(value).describe(
        (value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''),
      );
      break;
    case 'null':
      zodType = z.null().describe(value.description || '');
      break;
    default:
      throw new Error(`Unsupported JSON schema type: ${value.type}`);
  }

  return zodType;
}

export function jsonSchemaToModel(jsonSchema: Record<string, any>): ZodObject<any> {
  const properties = jsonSchema.properties;
  const requiredFields = jsonSchema.required || [];
  if (!properties) {
    return z.object({});
  }

  const zodSchema: Record<string, any> = {};
  for (const [key, _] of Object.entries(properties)) {
    const value = _ as any;
    let zodType;
    if (value.anyOf) {
      const anyOfTypes = value.anyOf.map((schema: any) => jsonSchemaPropertiesToTSTypes(schema));
      zodType = z
        .union(anyOfTypes)
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
    } else if (value.allOf) {
      const allOfTypes = value.allOf.map((schema: any) => jsonSchemaPropertiesToTSTypes(schema));
      zodType = z
        .intersection(
          allOfTypes[0],
          allOfTypes.slice(1).reduce((acc: z.ZodTypeAny, schema: z.ZodTypeAny) => acc.and(schema), allOfTypes[0]),
        )
        .describe((value.description || '') + (value.examples ? `\nExamples: ${value.examples.join(', ')}` : ''));
    } else {
      if (!value.type) {
        value.type = 'string';
      }
      zodType = jsonSchemaPropertiesToTSTypes(value);
    }

    if (value.description) {
      zodType = zodType.describe(value.description);
    }

    if (requiredFields.includes(key)) {
      zodSchema[key] = zodType;
    } else {
      zodSchema[key] = zodType.nullable();
    }
  }

  return z.object(zodSchema);
}

/**
 * Deep merges two objects, recursively merging nested objects and arrays
 */
export function deepMerge<T extends object = object>(target: T, source: Partial<T>): T {
  const output = { ...target };

  if (!source) return output;

  Object.keys(source).forEach(key => {
    const targetValue = output[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      (output as any)[key] = sourceValue;
    } else if (
      sourceValue instanceof Object &&
      targetValue instanceof Object &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue)
    ) {
      (output as any)[key] = deepMerge(targetValue, sourceValue as T);
    } else if (sourceValue !== undefined) {
      (output as any)[key] = sourceValue;
    }
  });

  return output;
}

export interface TagMaskOptions {
  /** Called when masking begins */
  onStart?: () => void;
  /** Called when masking ends */
  onEnd?: () => void;
  /** Called for each chunk that is masked */
  onMask?: (chunk: string) => void;
}

/**
 * Transforms a stream by masking content between XML tags.
 * @param stream Input stream to transform
 * @param tag Tag name to mask between (e.g. for <foo>...</foo>, use 'foo')
 * @param options Optional configuration for masking behavior
 */
export async function* maskStreamTags(stream: AsyncIterable<string>, tag: string, options: TagMaskOptions = {}) {
  const { onStart, onMask, onEnd } = options;
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  let outside = true; // current state: outside of target tag content
  let partialOpen = ''; // buffer for an incomplete opening tag sequence
  let partialClose = ''; // buffer for an incomplete closing tag sequence
  let skipBuffer = ''; // accumulates content of the masked section (for callback)
  let outputBuffer = ''; // accumulates output text to yield

  for await (const chunk of stream) {
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];

      if (outside) {
        // OUTSIDE STATE: looking for an opening tag
        if (partialOpen) {
          // We are in the middle of matching an open tag sequence
          partialOpen += char;

          if (openTag.startsWith(partialOpen)) {
            if (partialOpen === openTag) {
              // Full opening tag matched
              outside = false; // enter inside (masking) state
              partialOpen = ''; // reset open tag buffer
              if (onStart) onStart(); // trigger onStart callback
              skipBuffer = openTag; // store the opening tag in masked content buffer
            }
            // If it's a prefix (but not complete) of openTag, do nothing (wait for more chars)
            continue; // move to next character
          } else {
            // Mismatch: the gathered characters are not the target tag
            outputBuffer += partialOpen; // flush the buffered chars as normal output            i--; // back up to reprocess the current character
            partialOpen = ''; // reset buffer
            // Note: we include the current char in the flushed output (it's part of partialOpen)
            // and continue processing after this mismatch normally.
            // No continue here, since we might need to process `char` again if it could start a new sequence.
          }
        } else if (!partialOpen) {
          if (char === '<') {
            // Potential start of a tag – begin buffering for a target open tag
            partialOpen = '<';
            // We'll verify in subsequent characters if this becomes <tagName>
          } else {
            // Regular character outside any target tag
            outputBuffer += char;
          }
        }
      } else {
        // INSIDE STATE: currently masking content until closing tag is found
        if (partialClose) {
          // We have a partial closing tag sequence in progress
          partialClose += char;

          if (closeTag.startsWith(partialClose)) {
            if (partialClose === closeTag) {
              // Full closing tag matched – masked section ends here
              if (onMask) onMask(skipBuffer.slice(openTag.length)); // callback with the content that was masked
              if (onEnd) onEnd(); // callback signaling end of masking
              outside = true; // exit masking state
              partialClose = '';
              skipBuffer = ''; // reset masked content buffer for next section
            }
            // If still a prefix of closeTag, just wait for more chars
            continue;
          } else {
            // Mismatch: it wasn't actually the closing tag, treat buffered chars as content
            skipBuffer += partialClose; // flush the buffered would-be closing sequence as regular masked content
            partialClose = '';
            // No `continue` here, we will reprocess the current char as content in the next branch
            // (since the current char might be '<', which could start another closing sequence).
          }
        }

        if (!partialClose) {
          if (char === '<') {
            // Possible start of closing tag (or another tag inside)
            partialClose = '<';
            if (i + 1 < chunk.length && chunk[i + 1] !== '/') {
              // If the next char is not '/', this is not our closing tag –
              // treat '<' as normal content and cancel partialClose
              partialClose = '';
              skipBuffer += '<';
              continue;
            }
            // If next char is '/', we'll continue to collect and verify if it matches our closing tag.
          } else {
            // Any non-tag character inside the masked section
            skipBuffer += char;
          }
        }
      }
    } // end for (chars in chunk)

    // End of chunk: output any accumulated outside text
    if (outputBuffer) {
      yield outputBuffer;
      outputBuffer = '';
    }
    // (If still inside, we do not yield skipBuffer content; it remains buffered until the tag closes)
  }

  // After all chunks are processed:
  if (partialOpen) {
    // Stream ended while attempting an open tag (incomplete target tag) – output it as is
    outputBuffer += partialOpen;
    partialOpen = '';
  }
  if (outputBuffer) {
    yield outputBuffer;
    outputBuffer = '';
  }
  // If still inside (a tag opened but never closed), we simply end without emitting that content or callbacks.
}
