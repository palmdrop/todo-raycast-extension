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
  return (
    `- [${todoItem.checked ? 'X' : ' '}] ${todoItem.content}` +
    (todoItem.description ? `\n${todoItem.description}` : '')
  );
};

// TODO: should this return frontmatter directly?
export const parseTodoItemsFromMarkdown = (markdown: string) => {
  const contentWithoutFrontmatter = removeFrontmatter(markdown);

  const todoItems: TodoItem[] = [];

  const lines = contentWithoutFrontmatter.split('\n');
  const before: string[] = [];
  const after: string[] = [];

  let currentPool: string[] = [];
  for (const line of lines) {
    const match = line.match(TODO_REGEX);

    if (!match) {
      if (!todoItems.length) {
        before.push(line);
      } else {
        currentPool.push(line);
      }

      continue;
    }

    if (currentPool.length && todoItems.length) {
      todoItems.at(-1)!.description = currentPool.join('\n');
      currentPool = [];
    }

    const checked = !!(
      match[1] &&
      (match[1].trim() === 'x' || match[1].trim() === 'X')
    );

    todoItems.push({
      checked,
      content: match[2],
      description: '',
    });
  }

  if (currentPool.length) {
    const blocks = currentPool.join('\n').split('\n\n');
    todoItems.at(-1)!.description = blocks[0];
    after.push(...blocks.slice(1));
  }

  console.log(todoItems, before, after);

  return { todoItems, before, after };
};

export const convertTodoItemsToMarkdown = (
  currentMarkdown: string,
  todoItems: TodoItem[]
) => {
  const frontmatter = getFrontmatter(currentMarkdown);

  const { after, before } = parseTodoItemsFromMarkdown(currentMarkdown);

  const content =
    // Frontmatter
    (frontmatter ? `---\n${frontmatter}\n---\n\n` : '') +
    // Before
    (before.length ? before.join('\n') + '\n' : '') +
    // Items
    todoItems.map(todoItemToMarkdown).join('\n') +
    // After
    (after.length ? after.join('\n') : '');

  return content;
};
