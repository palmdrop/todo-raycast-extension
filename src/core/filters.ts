import { TodoItem } from '../core/types';

type FilterFunction = (item: TodoItem) => boolean;
type OrderFunction = (a: TodoItem, b: TodoItem) => number;

export type Filter = {
  label: string;
  group: string | null;
} & (
  | {
      filter: FilterFunction;
    }
  | {
      filter?: FilterFunction;
      order: OrderFunction;
    }
);

export type Filters = { [key: string]: Filter };

export const getFilters = (tags?: string[]): Filters =>
  ({
    all: {
      label: 'All',
      group: null,
      filter: () => true,
    },
    complete: {
      label: 'Complete',
      group: 'Status',
      filter: (item: TodoItem) => item.checked,
    },
    incomplete: {
      label: 'Incomplete',
      group: 'Status',
      filter: (item: TodoItem) => !item.checked,
    },
    'date-descending': {
      label: 'Due (descending)',
      group: 'Date',
      order: (a, b) => {
        if (a.due === null) return 1;
        if (b.due === null) return -1;

        return a.due!.getTime() - b.due!.getTime();
      },
    },
    'date-ascending': {
      label: 'Due (ascending)',
      group: 'Date',
      order: (a, b) => {
        if (a.due === null) return -1;
        if (b.due === null) return 1;

        return b.due!.getTime() - a.due!.getTime();
      },
    },
    ...(tags ?? []).reduce(
      (acc, tag) => {
        const filterKey = `tag-${tag}`;
        acc[filterKey] = {
          label: tag,
          group: 'Tags',
          filter: (item: TodoItem) => item.tags.includes(tag),
        };

        return acc;
      },
      {} as { [key: string]: Filter }
    ),
  }) as Filters;

export type TodoFilter = string;

export const NO_GROUP_KEY = '_';

export const getFiltersByGroup = (filters: Filters) =>
  Object.entries(filters).reduce(
    (acc, [key, filter]) => {
      const group = filter.group || NO_GROUP_KEY;
      const entries = [...(acc[group] ?? []), { key, ...filter }];

      acc[group] = entries;

      return acc;
    },
    {} as { [key: string]: (Filter & { key: string })[] }
  );

export const filterItems = (items: TodoItem[], filterEntry: Filter) => {
  const filter =
    (filterEntry as { filter: FilterFunction }).filter ?? (() => true);

  const filteredItems = items.filter(filter);

  const order = (filterEntry as { order: OrderFunction }).order;
  if (order) {
    return filteredItems.sort(order);
  }

  return filteredItems;
};
