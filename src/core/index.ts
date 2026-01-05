import * as data from './data';
import * as markdown from './markdown';
import { TodoItem } from './types';

export const getTodoItems = async (name: string) => {
  if (!data.exists(name)) throw new Error(`Todo list "${name}" does not exist`);

  const todoListData = await data.readTodoList(name);
  const { todoItems } = markdown.parseTodoItemsFromMarkdown(todoListData);
  return todoItems;
};

let writeLock: number | null = null;
export const updateTodoItems = async (name: string, todoItems: TodoItem[]) => {
  const now = Date.now();
  writeLock = now;

  if (!(await data.exists(name)))
    throw new Error(`Todo list "${name}" does not exist`);

  // TODO: this needs to be sync to allow cleanup write
  // NOTE: can be made sync by caching the filePath and convert read/write to sync
  // NOTE: Other option: always cache data, commit to file at next startup

  const currentContent = await data.readTodoList(name);

  const newContent = markdown.convertTodoItemsToMarkdown(
    currentContent,
    todoItems
  );

  // Prevents concurrent writes... kind of
  if (writeLock === now) {
    await data.updateTodoList(name, newContent);
  }

  writeLock = null;
};

export const getLatestTodoName = async () => {
  return await data.getLatestTodoName();
};
