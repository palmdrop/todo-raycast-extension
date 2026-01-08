import { LocalStorage } from '@raycast/api';
import { existsSync, statSync } from 'fs';
import fs from 'fs/promises';
import { popHistory, pushHistory } from './history';
import { clearHistory } from './history';

type TodoListData = {
  name: string;
  filePath: string;
};

const TODO_KEY_PREFIX = 'TODO';
const LATEST_TODO_KEY = 'LATEST_TODO';

const getKey = (name: string) =>
  `${TODO_KEY_PREFIX}_${name.replaceAll(' ', '_')}`;

const get = async (name: string) => {
  const storedData = await LocalStorage.getItem<string>(getKey(name));
  return storedData ? JSON.parse(storedData) : null;
};

//
export const exists = async (name: string) => {
  return !!(await LocalStorage.getItem<string>(getKey(name)));
};

// TODO: warn user if they register a todo with a path that already exists
const register = async (filePath: string, name: string) => {
  if (await exists(name)) {
    throw new Error(`Todo list with name "${name}"`);
  }

  await LocalStorage.setItem(getKey(name), JSON.stringify({ name, filePath }));
};

const unregister = async (name: string) => {
  if (!(await exists(name))) {
    throw new Error(`Todo list with name "${name}" does not exist`);
  }

  await LocalStorage.removeItem(getKey(name));
};

const list = async () => {
  const items = await LocalStorage.allItems();

  const todoItems = Object.entries(items)
    .filter(([key]) => key.startsWith(TODO_KEY_PREFIX))
    .map(([, value]) => JSON.parse(value) as TodoListData);

  return todoItems;
};

const read = async (name: string) => {
  const todo = await get(name);
  if (!todo) {
    throw new Error(`Todo list with name "${name}" does not exist`);
  }

  return await fs.readFile(todo.filePath, 'utf-8');
};

const write = async (name: string, content: string, pushToHistory = true) => {
  const todo = await get(name);
  if (!todo) {
    throw new Error(`Todo list with name "${name}" does not exist`);
  }

  await fs.writeFile(todo.filePath, content, 'utf-8');

  if (pushToHistory) {
    await pushHistory(name, {
      dateTime: new Date().toISOString(),
      content,
    });
  }
};

const restore = async (name: string, index = 0) => {
  const previous = await popHistory(name, index);

  if (!previous) throw new Error('No history to restore');

  await write(name, previous.content, false);

  return previous.content;
};

const setLatest = async (name: string) => {
  await LocalStorage.setItem(LATEST_TODO_KEY, name);
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

export const removeTodoList = async (name: string) => {
  await unregister(name);
};

export const listTodoLists = async () => {
  return await list();
};

export const readTodoList = async (name: string) => {
  const todo = await read(name);
  await setLatest(name);
  return todo;
};

export const updateTodoList = async (name: string, content: string) => {
  await setLatest(name);
  return await write(name, content);
};

export const getLatestTodoName = async () => {
  return await LocalStorage.getItem<string>(LATEST_TODO_KEY);
};

export const undoTodoListChange = async (name: string) => {
  return await restore(name);
};

export const clearUndoHistory = async (name: string) => {
  return await clearHistory(name);
};
