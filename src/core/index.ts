import * as data from './data';
import * as markdown from './markdown';
import * as history from './history';
import { ItemUUID, TodoList, TodoSection } from './types';

export const getTodoList = async (
  name: string,
  shouldInitHistory = false
): Promise<TodoList> => {
  if (!data.exists(name)) throw new Error(`Todo list "${name}" does not exist`);

  const todoListData = await data.readTodoList(name);
  const { sections } = markdown.parseTodoItemsFromMarkdown(todoListData);

  if (shouldInitHistory) {
    await data.initHistory(name);
  }

  return { name, sections };
};

let writeLock: number | null = null;
export const updateTodoItems = async (
  name: string,
  sections: TodoSection[],
  focusedItem: ItemUUID | null
) => {
  const now = Date.now();
  writeLock = now;

  if (!(await data.exists(name)))
    throw new Error(`Todo list "${name}" does not exist`);

  // TODO: this needs to be sync to allow cleanup write
  // NOTE: can be made sync by caching the filePath and convert read/write to sync
  // NOTE: Other option: always cache data, commit to file at next startup

  const focusedIndex = focusedItem
    ? sections
        .flatMap((section) => section.items)
        .findIndex((item) => item.id === focusedItem)
    : null;

  const currentContent = await data.readTodoList(name);

  const newContent = markdown.convertTodoListToMarkdown(currentContent, {
    name,
    sections,
  });

  // Prevents concurrent writes... kind of
  if (writeLock === now) {
    await data.updateTodoList(name, newContent, focusedIndex);
  }

  writeLock = null;
};

export const getLatestTodoName = async () => {
  return await data.getLatestTodoName();
};

export const initHistory = data.initHistory;

export const getHistory = history.get;

const findItemUUID = (sections: TodoSection[], index: number | null) => {
  if (index === null) return null;

  return (
    sections.flatMap((section) => section.items).find((_, i) => i === index)
      ?.id ?? null
  );
};

export const undoTodoListChange = async (name: string) => {
  const todoListData = await data.undoTodoListChange(name);
  const { sections } = markdown.parseTodoItemsFromMarkdown(
    todoListData.content
  );
  const focusedItem = findItemUUID(sections, todoListData.focusedItem);

  return { name, sections, focusedItem };
};

export const redoTodoListChange = async (name: string) => {
  const todoListData = await data.redoTodoListChange(name);
  const { sections } = markdown.parseTodoItemsFromMarkdown(
    todoListData.content
  );
  const focusedItem = findItemUUID(sections, todoListData.focusedItem);

  return { name, sections, focusedItem };
};

export const restoreTo = async (name: string, entry: history.HistoryEntry) => {
  const history = await getHistory(name);
  const index = history.undoStack.findIndex(
    (undoEntry) => undoEntry.dateTime === entry.dateTime
  );

  return await data.undoTodoListChange(name, index);
};

export const clearHistory = async (name: string) => {
  return await data.clearHistory(name);
};

export const canUndoRedo = history.canUndoRedo;
