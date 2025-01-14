import { jest } from '@jest/globals';
import { vol, fs } from 'memfs';

beforeEach(() => {
  vol.reset()
  jest.resetAllMocks()
})

jest.unstable_mockModule('./utils', () => ({
  checkDependencies: jest.fn(),
  checkInitialization: jest.fn(),
  writeIndexFile: jest.fn(),
  createComponentsDir: jest.fn(),
  writeAPIKey: jest.fn(),
  createMastraDir: jest.fn(),
  writeCodeSample: jest.fn()
}));

jest.unstable_mockModule('../../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    break: jest.fn(),
  },
}));

const utils = await import('./utils')
const { init } = await import('./init')
const { logger }  = await import('../../utils/logger')

describe('CLI', () => {

   test('creates the mastra directory and components directories', async () => {
      const mockCreateMastraDir = jest.spyOn(utils, 'createMastraDir').mockImplementation(async (directory) => {
      const dirPath = `${directory}/mastra`;
      fs.mkdirSync(dirPath, { recursive: true }); // Simulate directory creation
      return {ok: true, dirPath};
    });

    const mockCreateComponentsDir = jest.spyOn(utils, 'createComponentsDir').mockImplementation(async (dirPath, component) => {
      const componentPath = `${dirPath}/${component}`;
      fs.mkdirSync(componentPath, { recursive: true }); // Simulate component directory creation
    });

    jest.spyOn(utils, 'checkDependencies').mockResolvedValue('ok');
   

    await init({
      directory: '/mock',
      components: ['agents', 'tools'],
      addExample: false,
      llmProvider: 'openai',
      showSpinner: false,
    });

    expect(mockCreateMastraDir).toHaveBeenCalledWith('/mock');
    expect(mockCreateComponentsDir).toHaveBeenCalledWith('/mock/mastra', 'agents');
    expect(mockCreateComponentsDir).toHaveBeenCalledWith('/mock/mastra', 'tools');

    expect(fs.existsSync('/mock/mastra')).toBe(true);
    expect(fs.existsSync('/mock/mastra/agents')).toBe(true);
    expect(fs.existsSync('/mock/mastra/tools')).toBe(true);
  });

  test('generates correct index file content', async () => {
    jest.spyOn(utils, 'checkDependencies').mockResolvedValue('ok');
   

    jest.spyOn(utils, 'createMastraDir').mockImplementation(async (directory) => {
      const dirPath = `${directory}/mastra`;
      fs.mkdirSync(dirPath, { recursive: true });
      return {ok: true, dirPath};
    });

    jest.spyOn(utils, 'writeIndexFile').mockImplementation(async (dirPath, addExample) => {
      const content = addExample
        ? `
          import { Mastra } from '@mastra/core';
          export const mastra = new Mastra({});
        `
        : ``;
      fs.writeFileSync(`${dirPath}/index.ts`, content); // Simulate file creation
    });

    await init({
      directory: '/mock',
      components: ['agents'],
      addExample: true,
      llmProvider: 'openai',
      showSpinner: false,
    });

    const writtenFile = fs.readFileSync('/mock/mastra/index.ts', 'utf-8');
    expect(writtenFile).toContain('Mastra');
    expect(writtenFile).toContain('export const mastra = new Mastra({');
  });

  test('generates env file', async () => {
    jest.spyOn(utils, 'checkDependencies').mockResolvedValue('ok')

    jest.spyOn(utils, 'createMastraDir').mockImplementation(async (directory) => {
      const dirPath = `${directory}/mastra`;
      fs.mkdirSync(dirPath, { recursive: true });
      return { ok: true, dirPath};
    });

    jest.spyOn(utils, 'writeAPIKey').mockImplementation(async (llmProvider) => {
      const key = `${llmProvider.toUpperCase()}_API_KEY=`
      fs.writeFileSync('/mock/.env.development', key)
    })

    await init({
      directory: '/mock',
      components: ['agents'],
      addExample: false,
      llmProvider: 'openai',
      showSpinner: false,
    });

    const envFileContent = fs.readFileSync('/mock/.env.development', 'utf-8');
    expect(envFileContent).toContain('OPENAI_API_KEY')
  })

  test('stops initialization if dependencies are not satisfied', async () => {
  
    jest.spyOn(utils, 'checkDependencies').mockResolvedValue('No package.json file found in the current directory');

    await init({
      directory: '/mock',
      components: [],
      addExample: false,
      llmProvider: 'openai',
      showSpinner: false,
    })

    expect(logger.error).toHaveBeenCalledWith('No package.json file found in the current directory');
    expect(utils.createMastraDir).not.toHaveBeenCalled();
    expect(utils.writeIndexFile).not.toHaveBeenCalled();

    expect(fs.existsSync('/mock')).toBe(false);
  });

  test('stops initialization if mastra core is not installed', async () => {
    jest.spyOn(utils, 'checkDependencies').mockResolvedValue('Install @mastra/core before running this command (npm install @mastra/core)')

    await init({
      directory: '/mock',
      components: ['tools'],
      addExample: false,
      llmProvider: 'anthropic',
      showSpinner: false
    })

    expect(logger.error).toHaveBeenCalledWith('Install @mastra/core before running this command (npm install @mastra/core)');
    expect(utils.createMastraDir).not.toHaveBeenCalled()
    expect(utils.writeIndexFile).not.toHaveBeenCalled()

    expect(fs.existsSync('/mock')).toBe(false)
  })

  test('stops initialization if mastra is already setup', async () => {
    jest.spyOn(utils, 'checkDependencies').mockResolvedValue('ok');

    jest.spyOn(utils, 'createMastraDir').mockImplementation(async (directory) => {
      const dirPath = `${directory}/mastra`;
      fs.mkdirSync(dirPath, { recursive: true }); 
     
     return { ok: false }
    });

    const mockWriteIndexFile = jest.spyOn(utils, 'writeIndexFile');
    const mockWriteAPIKey = jest.spyOn(utils, 'writeAPIKey');

    await init({
      directory: '/mock',
      components: ['tools'],
      addExample: false,
      llmProvider: 'anthropic',
      showSpinner: false,
    });

    expect(logger.info).toHaveBeenCalledWith('Mastra already initialized');
    expect(mockWriteIndexFile).not.toHaveBeenCalled();
    expect(mockWriteAPIKey).not.toHaveBeenCalled();

    expect(fs.existsSync('/mock/mastra')).toBe(true);
  });
});
