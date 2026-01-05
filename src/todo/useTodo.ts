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

  const toggleItem = useCallback(
    async (index: number) => {
      update((items) => {
        if (!items) return null;

        if (items.length <= index) {
          throw new Error('No todo item at index ' + index);
        }

        const newItems = items.map((item, i) =>
          index !== i
            ? item
            : {
                ...item,
                checked: !item.checked,
              }
        );

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
  };
};
