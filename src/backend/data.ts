import { LocalStorage } from '@raycast/api';
import { existsSync, statSync } from 'fs';
import fs from 'fs/promises';

type TodoListData = {
  name: string;
  filePath: string;
};

type RegisteredTodos = TodoListData[];

const REGISTERED_TODOS_KEY = 'registered-todos';

export const exists = async ({
  name,
  path,
}: {
  name?: string;
  path?: string;
}) => {
  const storedData = await LocalStorage.getItem<string>(REGISTERED_TODOS_KEY);
  const registeredTodos: RegisteredTodos = storedData
    ? JSON.parse(storedData)
    : [];

  return (
    registeredTodos.find(
      (todo) => todo.name === name || todo.filePath === path
    ) !== undefined
  );
};

const register = async (filePath: string, name: string) => {
  const storedData = await LocalStorage.getItem<string>(REGISTERED_TODOS_KEY);

  const registeredTodos: RegisteredTodos = storedData
    ? JSON.parse(storedData)
    : [];

  if (await exists({ name, path: filePath })) {
    throw new Error(
      `Todo list with name "${name}" or path "${filePath}" already exists`
    );
  }

  registeredTodos.push({
    name,
    filePath,
  });

  console.log('REGISTER', REGISTERED_TODOS_KEY, registeredTodos);
  await LocalStorage.setItem(
    REGISTERED_TODOS_KEY,
    JSON.stringify(registeredTodos)
  );
};

const unregister = async (name: string) => {
  const storedData = await LocalStorage.getItem(REGISTERED_TODOS_KEY);
  if (!storedData) {
    return;
  }

  const registeredTodos: RegisteredTodos = JSON.parse(storedData as string);

  const index = registeredTodos.findIndex((todo) => todo.name === name);
  if (index === -1) {
    throw new Error(`Todo list with name "${name}" does not exist`);
  }

  registeredTodos.splice(index, 1);

  console.log('UNREGISTER', REGISTERED_TODOS_KEY, registeredTodos);
  await LocalStorage.setItem(
    REGISTERED_TODOS_KEY,
    JSON.stringify(registeredTodos)
  );
};

const list = async () => {
  const storedData = await LocalStorage.getItem(REGISTERED_TODOS_KEY);
  console.log('LISTING', storedData);
  const registeredTodos: RegisteredTodos = storedData
    ? JSON.parse(storedData as string)
    : [];
  return registeredTodos;
};

const get = async (name: string) => {
  const storedData = await LocalStorage.getItem(REGISTERED_TODOS_KEY);
  const registeredTodos: RegisteredTodos = storedData
    ? JSON.parse(storedData as string)
    : [];

  return registeredTodos.find((todo) => todo.name === name);
};

const read = async (name: string) => {
  const todo = await get(name);
  if (!todo) {
    throw new Error(`Todo list with name "${name}" does not exist`);
  }

  return await fs.readFile(todo.filePath, 'utf-8');
};

const write = async (name: string, content: string) => {
  const todo = await get(name);
  if (!todo) {
    throw new Error(`Todo list with name "${name}" does not exist`);
  }

  await fs.writeFile(todo.filePath, content, 'utf-8');
};

const isFileValid = (filePath: string) => {
  const exists = existsSync(filePath);
  if (!exists) {
    return {
      message: 'File does not exist',
      status: 'ERROR',
    };
  }

  const isFile = statSync(filePath).isFile();
  if (!isFile) {
    return {
      message: 'Path is not a file',
      status: 'ERROR',
    };
  }

  const isMarkdownFile = filePath.endsWith('.md');
  if (!isMarkdownFile) {
    return {
      message: 'Path is not a markdown file',
      status: 'ERROR',
    };
  }

  return {
    message: 'File is valid',
    status: 'SUCCESS',
  };
};

const isDirectoryValid = (directoryPath: string) => {
  const exists = existsSync(directoryPath);
  if (!exists) {
    return {
      message: 'Directory does not exist',
      status: 'ERROR',
    };
  }

  const isDirectory = statSync(directoryPath).isDirectory();
  if (!isDirectory) {
    return {
      message: 'Path is not a directory',
      status: 'ERROR',
    };
  }

  return {
    message: 'Directory is valid',
    status: 'SUCCESS',
  };
};

export const addExistingTodoList = async (filePath: string, name: string) => {
  const fileStatus = isFileValid(filePath);
  if (fileStatus.status === 'ERROR') {
    throw new Error(fileStatus.message);
  }

  await register(filePath, name);
};

export const createTodoList = async (
  directoryPath: string,
  fileName: string,
  name: string
) => {
  const directoryStatus = isDirectoryValid(directoryPath);
  if (directoryStatus.status === 'ERROR') {
    console.log(directoryStatus.message);
    await fs.mkdir(directoryPath, { recursive: true });
  }

  const filePath = `${directoryPath}/${fileName}.md`;
  // TODO: interact with vscode dendron plugin to create a file?

  // TODO: add file template? frontmatter?
  await fs.writeFile(filePath, '', 'utf-8');

  const fileStatus = isFileValid(filePath);
  if (fileStatus.status === 'ERROR') {
    throw new Error(fileStatus.message);
  }

  await register(filePath, name);
};

// NOTE: rewrite... this code does not really care that we are dealing with TODOs... could be anything
// NOTE: also store each list data as one separate key in LocalStorage?
export const removeTodoList = async (name: string) => {
  await unregister(name);
};

export const listTodoLists = async () => {
  return await list();
};

export const readTodoList = async (name: string) => {
  return await read(name);
};

export const updateTodoList = async (name: string, content: string) => {
  return await write(name, content);
};
