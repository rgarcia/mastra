import { z } from "zod";

export class Step<
  TStepId extends string,
  TSchemaIn extends z.ZodSchema,
  TSchemaOut extends z.ZodSchema
> {
  id: TStepId;
  inputSchema?: TSchemaIn;
  outputSchema?: TSchemaOut;
  payload?: z.infer<TSchemaIn>;
  action?: (args: z.infer<TSchemaIn>) => z.infer<TSchemaOut>;

  constructor({id, inputSchema, outputSchema, payload, action}: {id: TStepId, inputSchema?: TSchemaIn, outputSchema?: TSchemaOut, payload?: z.infer<TSchemaIn>, action?: (args: z.infer<TSchemaIn>) => z.infer<TSchemaOut>}) {
    this.id = id;
    this.inputSchema = inputSchema;
    this.payload = payload;
    this.outputSchema = outputSchema;
    this.action = action;
  }
}