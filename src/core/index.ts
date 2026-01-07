import * as data from './data';
import * as markdown from './markdown';
import { TodoList, TodoSection } from './types';

export const getTodoList = async (name: string): Promise<TodoList> => {
  if (!data.exists(name)) throw new Error(`Todo list "${name}" does not exist`);

  const todoListData = await data.readTodoList(name);
  const { sections } = markdown.parseTodoItemsFromMarkdown(todoListData);
  return { name, sections };
};

let writeLock: number | null = null;
export const updateTodoItems = async (
  name: string,
  sections: TodoSection[]
) => {
  const now = Date.now();
  writeLock = now;

  if (!(await data.exists(name)))
    throw new Error(`Todo list "${name}" does not exist`);

  // TODO: this needs to be sync to allow cleanup write
  // NOTE: can be made sync by caching the filePath and convert read/write to sync
  // NOTE: Other option: always cache data, commit to file at next startup

  const currentContent = await data.readTodoList(name);

  const newContent = markdown.convertTodoListToMarkdown(currentContent, {
    name,
    sections,
  });

  // Prevents concurrent writes... kind of
  if (writeLock === now) {
    await data.updateTodoList(name, newContent);
  }

  writeLock = null;
};

export const getLatestTodoName = async () => {
  return await data.getLatestTodoName();
};
