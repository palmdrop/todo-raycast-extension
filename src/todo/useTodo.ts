import { useCallback, useEffect, useMemo, useState } from 'react';
import { TodoItem } from '../core/types';
import * as core from '../core';
import { popToRoot, showToast, Toast } from '@raycast/api';

export const useTodo = (initialName?: string) => {
  const [name, setName] = useState(initialName);
  const [todoItems, setTodoItems] = useState<TodoItem[] | null>(null);

  const init = useMemo(() => {
    let isRunning = false;
    const init = async (name?: string) => {
      isRunning = true;
      try {
        if (!name || init.aborted) return;

        const items = await core.getTodoItems(name);
        if (init.aborted) return;

        setTodoItems(items);
      } catch (error: unknown) {
        console.error(error);
        showToast(
          Toast.Style.Failure,
          (error as { message?: string }).message ??
            'Failed to read todo list: ' + name
        );

        popToRoot();
      } finally {
        init.aborted = false;
        isRunning = false;
      }
    };

    init.aborted = false;

    init.cancel = () => {
      if (!isRunning) return;
      init.aborted = true;
    };

    return init;
  }, [setTodoItems, name]);

  useEffect(() => {
    let aborted = false;
    if (!initialName) {
      core.getLatestTodoName().then((name) => {
        if (aborted) return;
        setName(name);
      });
    }

    return () => {
      aborted = true;
    };
  }, [initialName]);

  useEffect(() => {
    init(name);
  }, [init, name]);

  const revaluate = useCallback(async () => {
    init.cancel();
    await init(name);
  }, [init, name]);

  const commit = useCallback(
    async (todoItems: TodoItem[] | null) => {
      return await core.updateTodoItems(name!, todoItems ?? []);
    },
    [name]
  );

  const update = useCallback(
    async (
      items: TodoItem[] | ((current: TodoItem[] | null) => TodoItem[] | null)
    ) => {
      const newItems = typeof items === 'function' ? items(todoItems) : items;
      await commit(newItems);
      revaluate();
    },
    [commit, revaluate, todoItems]
  );

  const updateItem = useCallback(
    async (
      item: Partial<TodoItem> | ((item: TodoItem) => Partial<TodoItem>),
      index: number
    ) => {
      update((previousItems) => {
        if (!previousItems) return null;

        if (previousItems.length <= index) {
          throw new Error('No todo item at index ' + index);
        }

        const newItems = previousItems.map((existingItem, i) =>
          index !== i
            ? existingItem
            : {
                ...existingItem,
                ...(typeof item === 'function' ? item(existingItem) : item),
              }
        );

        return newItems;
      });
    },
    [update]
  );

  const toggleItem = useCallback(
    async (index: number) => {
      updateItem(
        (item) => ({
          ...item,
          checked: !item.checked,
        }),
        index
      );
    },
    [update]
  );

  const removeItem = useCallback(
    async (index: number) => {
      update((previousItems) => {
        // NOTE: code duplication... fix
        if (!previousItems) return null;

        if (previousItems.length <= index) {
          throw new Error('No todo item at index ' + index);
        }

        return previousItems.filter((_, i) => i !== index);
      });
    },
    [update]
  );

  const addItem = useCallback(
    async (item: TodoItem, index?: number, after?: boolean) => {
      update((previousItems) => {
        if (!previousItems?.length) return [item];

        if (typeof index === 'undefined') {
          return [...(previousItems ?? []), item];
        }

        if (index < 0 || index > previousItems.length) {
          throw new Error('Index out of bounds');
        }

        const newItems = [...previousItems];
        newItems.splice(index + (after ? 1 : 0), 0, item);

        return newItems;
      });
    },
    [update]
  );

  const createItem = useCallback(
    async (initialFields?: Partial<TodoItem>) => {
      const item: TodoItem = {
        checked: false,
        content: '',
        description: '',
        due: null,
        ...(initialFields ?? {}),
      };

      return item;
    },
    [addItem]
  );

  const swapItems = useCallback(
    async (indexA: number, indexB: number) => {
      update((previousItems) => {
        if (!previousItems) return null;

        if (previousItems.length <= indexA || previousItems.length <= indexB) {
          throw new Error('Index out of bounds');
        }

        const newItems = [...previousItems];
        [newItems[indexA], newItems[indexB]] = [
          newItems[indexB],
          newItems[indexA],
        ];

        return newItems;
      });
    },
    [update]
  );

  return {
    name,
    items: todoItems,
    revaluate,
    commit,
    update,
    toggleItem,
    updateItem,
    removeItem,
    addItem,
    createItem,
    swapItems,
  };
};
