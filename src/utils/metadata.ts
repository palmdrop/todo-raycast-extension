import { TodoList } from '../core/types';

export const collectTodoListMetadata = (todoList: TodoList) => {
  const allItems = todoList.sections.flatMap((section) => section.items);

  const uncheckedCount = allItems.filter(
    (item) => item.status === 'unchecked'
  ).length;

  const checkedCount = allItems.filter(
    (item) => item.status === 'checked'
  ).length;

  const invalidCount = allItems.filter(
    (item) => item.status === 'invalid'
  ).length;

  return {
    numberOfItems: allItems.length,
    uncheckedCount,
    checkedCount,
    invalidCount,
  };
};
