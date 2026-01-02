import * as data from './data';
import * as markdown from './markdown';
import { TodoItem } from './types';

export const getTodoItems = async (name: string) => {
  if (!data.exists({ name }))
    throw new Error(`Todo list "${name}" does not exist`);

  const todoListData = await data.readTodoList(name);
  const { todoItems } = markdown.parseTodoItemsFromMarkdown(todoListData);
  return todoItems;
};

export const updateTodoItems = async (name: string, todoItems: TodoItem[]) => {
  if (!data.exists({ name }))
    throw new Error(`Todo list "${name}" does not exist`);

  const currentContent = await data.readTodoList(name);

  const newContent = markdown.convertTodoItemsToMarkdown(
    currentContent,
    todoItems
  );

  await data.updateTodoList(name, newContent);
  // console.log('NEW', newContent);
};
