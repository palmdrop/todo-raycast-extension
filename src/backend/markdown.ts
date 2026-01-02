import { TodoItem } from './types';

const TODO_REGEX = /^- \[(x|X| )?\] (.*)/;

// TODO: store list data in the frontmatter, but make sure to preserve existing fields
// TODO: and update "updatedAt" fields
const removeFrontmatter = (content: string) => {
  const parts = content.split('---');
  return parts.at(-1)!.trim();
};

const getFrontmatter = (content: string) => {
  const parts = content.split('---');
  if (parts.length === 1) return undefined;
  return parts.at(1)?.trim();
};

const todoItemToMarkdown = (todoItem: TodoItem) => {
  // TODO: does not yet support description
  return `- [${todoItem.checked ? 'X' : ' '}] ${todoItem.content}`;
};

// TODO: should this return frontmatter directly?
export const parseTodoItemsFromMarkdown = (markdown: string) => {
  const contentWithoutFrontmatter = removeFrontmatter(markdown);

  const todoItems: TodoItem[] = [];

  const lines = contentWithoutFrontmatter.split('\n');
  const rest: { line: string; index: number }[] = [];

  for (const line of lines) {
    const match = line.match(TODO_REGEX);

    if (!match) {
      rest.push({ line, index: lines.length });
      continue;
    }

    const checked = !!(
      match[1] &&
      (match[1].trim() === 'x' || match[1].trim() === 'X')
    );

    todoItems.push({
      checked,
      content: match[2],
    });
  }

  return { todoItems, rest };
};

export const convertTodoItemsToMarkdown = (
  currentMarkdown: string,
  todoItems: TodoItem[]
) => {
  const frontmatter = getFrontmatter(currentMarkdown);

  // const { rest } = parseTodoItemsFromMarkdown(currentMarkdown);
  // TODO: merge with "rest" using line indices. Try to reconcile somehow?
  // NOTE: probably will be very difficult... maybe just append it at the bottom. Force user to use correct format

  const content =
    '---\n' +
    frontmatter +
    '\n---\n\n' +
    todoItems.map(todoItemToMarkdown).join('\n');

  return content;
};
