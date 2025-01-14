import * as esbuild from 'esbuild';
import { join } from 'path';

import { upsertMastraDir } from '../commands/deploy/utils.js';

import { getFirstExistingFile } from './get-first-existing-file.js';
import { logger } from './logger.js';

export async function bundleServer(entryPoint: string) {
  try {
    // Ensure .mastra directory exists
    upsertMastraDir();

    const outfile = join(process.cwd(), '.mastra', 'server.mjs');

    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      target: 'node20',
      sourcemap: true,
      mainFields: ['module', 'main'],
      minify: false, // Set to true if you want minification
      metafile: true, // Generates build metadata
      logLevel: 'error',
      logOverride: {
        'commonjs-variable-in-esm': 'silent',
      },
      banner: {
        js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
      },
      external: [
        // Mark node built-ins as external
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'util',
        'events',
        'http',
        'https',
        'net',
        'tls',
        'zlib',
        'child_process',
        'worker_threads',
        'cluster',
        'dns',
        'dgram',
        'readline',
        'repl',
        'tty',
        'url',
        'v8',
        'vm',
        'module',
        'process',
        '@mastra/core',
      ],
    });

    // Output build metadata
    await esbuild.analyzeMetafile(result.metafile);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Missing required file,')) {
        logger.info('Cannot find mastra: add your directory with --dir <dir>');
      }
    } else {
      console.error('Server build failed:', error);
    }
    process.exit(1);
  }
}

export async function bundle(dirPath: string) {
  try {
    // Ensure .mastra directory exists
    upsertMastraDir();

    const entryPoint = getFirstExistingFile([join(dirPath, 'index.ts')]);
    const outfile = join(process.cwd(), '.mastra', 'mastra.mjs');

    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      target: 'node20',
      sourcemap: true,
      minify: false, // Set to true if you want minification
      metafile: true, // Generates build metadata
      logLevel: 'error',
      mainFields: ['module', 'main'],
      conditions: ['import', 'node'],
      banner: {
        js: `
          import { createRequire } from 'module';
          const require = createRequire(import.meta.url);
        `,
      },
      logOverride: {
        'commonjs-variable-in-esm': 'silent',
      },
      external: [
        // Mark node built-ins as external
        'assert',
        'buffer',
        'child_process',
        'cluster',
        'constants',
        'crypto',
        'dgram',
        'dns',
        'events',
        'fs',
        'http',
        'http2',
        'https',
        'module',
        'net',
        'os',
        'path',
        'process',
        'punycode',
        'querystring',
        'readline',
        'repl',
        'stream',
        'string_decoder',
        'sys',
        'timers',
        'tls',
        'tty',
        'url',
        'util',
        'v8',
        'vm',
        'wasi',
        'worker_threads',
        'zlib',

        // Your packages
        '@mastra/core',
        '@mastra/memory',
      ],
    });

    // Log build results
    logger.success('Build completed successfully');

    // Output build metadata
    await esbuild.analyzeMetafile(result.metafile);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Missing required file,')) {
        logger.info('Cannot find mastra: add your directory with --dir <dir>');
      }
    } else {
      console.error('Build failed:', error);
    }
    process.exit(1);
  }
}
