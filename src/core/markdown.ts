import { ItemStatus, TodoItem, TodoList, TodoSection } from './types';
import { createItem, createSection } from './utils';

const TODO_REGEX = /^- \[(x|X|-| )?\] (.*)/;
const SECTION_REGEX = /^# (.*)/;

const INDENT = '  ';
const PROPERTY_PREFIX = '* ';

const STATUS_TO_SYMBOL: { [key in ItemStatus]: string[] } = {
  unchecked: [' ', ''],
  checked: ['x', 'X'],
  invalid: ['-'],
};

const SYMBOL_TO_STATUS = (
  Object.entries(STATUS_TO_SYMBOL) as [ItemStatus, string[]][]
).reduce(
  (acc, [key, value]) => {
    value.forEach((symbol) => (acc[symbol] = key));
    return acc;
  },
  {} as { [key: string]: ItemStatus }
);

type AdditionalProperties = keyof Omit<
  TodoItem,
  'content' | 'status' | 'description'
>;

// TODO: store list data in the frontmatter, but make sure to preserve existing fields
// TODO: and update "updatedAt" fields
export const removeFrontmatter = (content: string) => {
  const parts = content.split('---');
  return parts.at(-1)!.trim();
};

const getFrontmatter = (content: string) => {
  const parts = content.split('---');
  if (parts.length === 1) return undefined;
  return parts.at(1)?.trim();
};

const todoItemToMarkdown = (todoItem: TodoItem) => {
  const printProperty = (key: AdditionalProperties) => {
    const value = todoItem[key];
    if (!value || (Array.isArray(value) && !value.length)) return undefined;
    return `${INDENT}${PROPERTY_PREFIX}${key}: ${value.toString()}`;
  };

  const properties = (
    Object.keys(todoItem).filter(
      (key) => !['id', 'content', 'status', 'description'].includes(key)
    ) as AdditionalProperties[]
  )
    .map(printProperty)
    .filter(Boolean)
    .join('\n');

  return (
    `- [${STATUS_TO_SYMBOL[todoItem.status][0]}] ${todoItem.content}` +
    (todoItem.description
      ? `\n${todoItem.description
          .split('\n')
          .map((line) => `${INDENT}${line}`)
          .join('\n')}`
      : '') +
    (properties ? `\n${properties}` : '') +
    '\n'
  );
};

const todoSectionToMarkdown = (section: TodoSection) => {
  const items = section.items.map(todoItemToMarkdown).join('\n');
  return `${section.name ? `# ${section.name}\n` : ''}${items}`;
};

export const parseTodoItemsFromMarkdown = (markdown: string) => {
  const contentWithoutFrontmatter = removeFrontmatter(markdown);

  const sections: TodoSection[] = [];

  const lines = contentWithoutFrontmatter.split('\n');
  const before: string[] = [];
  const after: string[] = [];

  const addAdditionalDataToItem = (
    todoItem: TodoItem,
    additionalData: string[]
  ) => {
    if (!additionalData.length) return;

    const handleProperty = (key: AdditionalProperties, value: string) => {
      if (!value?.trim().length) return undefined;

      switch (key) {
        case 'due':
          return (todoItem.due = new Date(value));
        case 'created':
          return (todoItem.created = new Date(value));
        case 'tags':
          return (todoItem.tags = value.split(',').map((tag) => tag.trim()));
        // Handled elsewhere
        case 'id':
        default:
          return undefined;
      }
    };

    const description: string[] = [];
    for (const line of additionalData) {
      const trimmed = line.trim();

      const colonIndex = trimmed.indexOf(':');
      if (trimmed.startsWith(PROPERTY_PREFIX) && colonIndex !== -1) {
        const key = trimmed.slice(PROPERTY_PREFIX.length, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();

        // NOTE: This looks ugly
        try {
          if (!handleProperty(key as AdditionalProperties, value)) {
            description.push(trimmed);
          }
        } catch (error: unknown) {
          console.error(error);
          console.warn('WARNING: could not parse property', key, value);
        }
      } else {
        description.push(trimmed);
      }
    }

    todoItem.description = description.join('\n').trim();
  };

  // TODO: simplify this code lol
  let currentPool: string[] = [];
  for (const line of lines) {
    const match = line.match(TODO_REGEX);
    const sectionMatch = line.match(SECTION_REGEX);

    if (sectionMatch) {
      const name = sectionMatch[1].trim();

      if (currentPool.length) {
        addAdditionalDataToItem(sections.at(-1)!.items.at(-1)!, currentPool);
        currentPool = [];
      }

      sections.push(
        createSection({
          name,
        })
      );

      continue;
    }

    if (!match) {
      if (sections.length && sections.at(-1)?.items.length) {
        currentPool.push(line);
      } else {
        before.push(line);
      }

      continue;
    }

    if (!sections.length) {
      sections.push(createSection());
    }

    const currentSection = sections.at(-1)!;
    const todoItems = currentSection.items;

    if (currentPool.length && todoItems.length) {
      addAdditionalDataToItem(todoItems.at(-1)!, currentPool);
      currentPool = [];
    }

    const statusString = match[1]?.trim() ?? '';
    const status = SYMBOL_TO_STATUS[statusString];

    todoItems.push(
      createItem({
        status,
        content: match[2],
      })
    );
  }

  if (currentPool.length) {
    // NOTE: excessive joins and splits
    const blocks = currentPool.join('\n').split('\n\n');
    const todoItems = sections.at(-1)!.items;
    addAdditionalDataToItem(todoItems.at(-1)!, blocks[0].split('\n'));
    after.push(...blocks.slice(1));
  }

  if (!sections.length) {
    sections.push(createSection());
  }

  return { sections, before, after };
};

export const convertTodoListToMarkdown = (
  currentMarkdown: string,
  todoList: TodoList
) => {
  const frontmatter = getFrontmatter(currentMarkdown);

  const { before, after } = parseTodoItemsFromMarkdown(currentMarkdown);

  const content =
    // Frontmatter
    (frontmatter ? `---\n${frontmatter}\n---\n\n` : '') +
    // Before
    (before.length ? before.join('\n') + '\n' : '') +
    // Items
    (todoList.sections.map(todoSectionToMarkdown).join('\n') + '\n') +
    // After
    (after.length ? after.join('\n') : '');

  return content;
};
