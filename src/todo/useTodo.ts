import { useCallback, useEffect, useMemo, useState } from 'react';
import { TodoItem, TodoSection } from '../core/types';
import * as core from '../core';
import { popToRoot, showToast, Toast } from '@raycast/api';

// TODO: Cache data either here or in core/data.ts to ensure hook can be used in multiple components without re-parsing
export const useTodo = (initialName?: string) => {
  const [name, setName] = useState(initialName);
  const [todoSections, setTodoSections] = useState<TodoSection[] | null>(null);

  const init = useMemo(() => {
    let isRunning = false;
    const init = async (name?: string) => {
      isRunning = true;
      try {
        if (!name || init.aborted) return;

        const { sections } = await core.getTodoList(name);
        if (init.aborted) return;

        setTodoSections(sections);
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
  }, [setTodoSections, name]);

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

    return () => {
      init.cancel();
    };
  }, [init, name]);

  const revaluate = useCallback(async () => {
    init.cancel();
    await init(name);
  }, [init, name]);

  const commit = useCallback(
    async (todoSections: TodoSection[]) => {
      return await core.updateTodoItems(name!, todoSections);
    },
    [name]
  );

  const update = useCallback(
    async (
      sections:
        | TodoSection[]
        | ((current: TodoSection[] | null) => TodoSection[])
    ) => {
      const newSections =
        typeof sections === 'function' ? sections(todoSections) : sections;

      await commit(newSections);
      revaluate();
    },
    [commit, revaluate, todoSections]
  );

  const updateSection = useCallback(
    (
      section: TodoSection | ((previousSection: TodoSection) => TodoSection),
      index: number
    ) => {
      update((previousSections) => {
        if (!previousSections) return [];

        if (previousSections.length <= index) {
          throw new Error('No section at index ' + index);
        }

        const previousSection = previousSections[index];
        const newSection =
          typeof section === 'function' ? section(previousSection) : section;

        return [
          ...previousSections.slice(0, index),
          newSection,
          ...previousSections.slice(index + 1),
        ];
      });
    },
    [update]
  );

  const updateItem = useCallback(
    async (
      item: Partial<TodoItem> | ((item: TodoItem) => Partial<TodoItem>),
      itemIndex: number,
      sectionIndex = 0
    ) => {
      updateSection((previousSection) => {
        if (previousSection.items.length <= itemIndex) {
          throw new Error('No todo item at index ' + itemIndex);
        }

        const newSection = previousSection.items.map((existingItem, i) =>
          itemIndex !== i
            ? existingItem
            : {
                ...existingItem,
                ...(typeof item === 'function' ? item(existingItem) : item),
              }
        );

        return {
          ...previousSection,
          items: newSection,
        };
      }, sectionIndex);
    },
    [update]
  );

  const toggleItem = useCallback(
    async (index: number, sectionIndex = 0) => {
      updateItem(
        (item) => ({
          ...item,
          checked: !item.checked,
        }),
        index,
        sectionIndex
      );
    },
    [update]
  );

  const removeItem = useCallback(
    async (itemIndex: number, sectionIndex = 0) => {
      updateSection((previousSection) => {
        if (previousSection.items.length <= itemIndex) {
          throw new Error('No todo item at index ' + itemIndex);
        }

        const newItems = previousSection.items.filter(
          (_, i) => i !== itemIndex
        );
        return {
          ...previousSection,
          items: newItems,
        };
      }, sectionIndex);
    },
    [update]
  );

  const addItem = useCallback(
    async (
      item: TodoItem,
      itemIndex: number,
      sectionIndex = 0,
      after?: boolean
    ) => {
      updateSection((previousSection) => {
        if (itemIndex < 0 || itemIndex > previousSection.items.length) {
          throw new Error('Index out of bounds');
        }

        const newItems = [...previousSection.items];
        newItems.splice(itemIndex + (after ? 1 : 0), 0, item);

        return {
          ...previousSection,
          items: newItems,
        };
      }, sectionIndex);
    },
    [update]
  );

  const createItem = useCallback(async (initialFields?: Partial<TodoItem>) => {
    const item: TodoItem = {
      checked: false,
      content: '',
      description: '',
      due: null,
      ...(initialFields ?? {}),
    };

    return item;
  }, []);

  const createSection = useCallback(
    async (initialFields?: Partial<TodoSection>) => {
      const section: TodoSection = {
        name: '',
        items: [],
        ...(initialFields ?? {}),
      };

      return section;
    },
    []
  );

  const swapItems = useCallback(
    async (
      itemIndexA: number,
      sectionIndexA: number,
      itemIndexB: number,
      sectionIndexB: number
    ) => {
      update((previousSections) => {
        if (!previousSections) return [];

        if (sectionIndexA < 0 || sectionIndexA >= previousSections.length) {
          throw new Error('Section index A out of bounds');
        }

        if (sectionIndexB < 0 || sectionIndexB >= previousSections.length) {
          throw new Error('Section index B out of bounds');
        }

        const newSections = [...previousSections];

        const sectionA = newSections[sectionIndexA];
        const sectionB = newSections[sectionIndexB];

        if (itemIndexA < 0 || itemIndexA >= sectionA.items.length) {
          throw new Error('Item index A out of bounds');
        }

        if (itemIndexB < 0 || itemIndexB >= sectionB.items.length) {
          throw new Error('Item index B out of bounds');
        }

        const itemA = sectionA.items[itemIndexA];
        const itemB = sectionB.items[itemIndexB];
        sectionA.items[itemIndexA] = itemB;
        sectionB.items[itemIndexB] = itemA;

        return newSections;
      });
    },
    [update]
  );

  const moveItem = useCallback(
    async (
      itemIndex: number,
      sectionIndex: number,
      direction: 'up' | 'down'
    ) => {
      if (!todoSections) return null;

      const sourceSectionIndex = sectionIndex;
      const sourceItemIndex = itemIndex;
      const sourceSection = todoSections[sourceSectionIndex];

      let targetSectionIndex = sourceSectionIndex;
      let targetIndex;

      if (direction === 'up' && sourceItemIndex === 0) {
        targetSectionIndex--;
      } else if (
        direction === 'down' &&
        itemIndex === sourceSection.items.length - 1
      ) {
        targetSectionIndex++;
      }

      if (targetSectionIndex < 0) {
        targetSectionIndex = todoSections.length - 1;
      } else if (targetSectionIndex > todoSections.length - 1) {
        targetSectionIndex = 0;
      }

      const targetSection = todoSections[targetSectionIndex];

      if (targetSectionIndex === sourceSectionIndex) {
        targetIndex = sourceItemIndex + (direction === 'up' ? -1 : 1);
      } else {
        targetIndex = direction === 'up' ? targetSection.items.length : 0;
      }

      if (targetSectionIndex === sourceSectionIndex) {
        await swapItems(
          sourceItemIndex,
          sourceSectionIndex,
          targetIndex,
          targetSectionIndex
        );
      } else {
        await update((previousSections) => {
          if (!previousSections) return [];

          const newSections = [...previousSections];
          const sourceSection = newSections[sourceSectionIndex];
          const targetSection = newSections[targetSectionIndex];

          const [item] = sourceSection.items.splice(sourceItemIndex, 1);
          targetSection.items.splice(targetIndex, 0, item);

          return newSections;
        });
      }

      return {
        sectionIndex: targetSectionIndex,
        itemIndex: targetIndex,
      };
    },
    [swapItems, todoSections]
  );

  const addSection = useCallback(
    async (
      section: TodoSection,
      afterSectionIndex: number,
      insertAtTodoIndex?: number
    ) => {
      await update((previousSections) => {
        if (!previousSections) {
          previousSections = [];
        }

        if (
          afterSectionIndex < 0 ||
          afterSectionIndex > previousSections?.length
        ) {
          throw new Error('Section index out of bounds');
        }

        if (insertAtTodoIndex !== undefined) {
          if (
            afterSectionIndex < 0 ||
            afterSectionIndex > previousSections.length - 1
          ) {
            throw new Error('Section index out of bounds');
          }

          const sectionBefore = previousSections[afterSectionIndex];

          if (
            insertAtTodoIndex < 0 ||
            sectionBefore.items.length < insertAtTodoIndex
          ) {
            throw new Error('Item index out of bounds');
          }

          const itemsInNewSection = sectionBefore.items.slice(
            insertAtTodoIndex + 1
          );

          sectionBefore.items = sectionBefore.items.slice(
            0,
            insertAtTodoIndex + 1
          );
          section.items.push(...itemsInNewSection);
        }

        return [
          ...previousSections.slice(0, afterSectionIndex + 1),
          section,
          ...previousSections.slice(afterSectionIndex + 1),
        ];
      });

      return { section, index: afterSectionIndex + 1 };
    },
    [update]
  );

  const removeSection = useCallback(
    async (sectionIndex: number, keepItems?: boolean) => {
      await update((previousSections) => {
        if (!previousSections) return [];

        if (sectionIndex < 0 || sectionIndex > previousSections.length - 1) {
          throw new Error('Section index out of bounds');
        }

        const newSections = [...previousSections];

        if (sectionIndex === 0) {
          // Default section needs to always exist, but name can be hidden.
          newSections[0].name = undefined;
          return newSections;
        }

        if (keepItems) {
          const items = newSections[sectionIndex].items;
          newSections[sectionIndex - 1].items.push(...items);
        }

        newSections.splice(sectionIndex, 1);

        return newSections;
      });
    },
    [update]
  );

  const getItem = useCallback(
    (itemIndex: number, sectionIndex = 0) => {
      if (!todoSections) return null;
      return todoSections[sectionIndex]?.items[itemIndex];
    },
    [todoSections]
  );

  return {
    name,
    sections: todoSections,
    getItem,
    revaluate,
    commit,
    update,
    toggleItem,
    updateItem,
    removeItem,
    addItem,
    createItem,
    createSection,
    swapItems,
    moveItem,
    updateSection,
    addSection,
    removeSection,
  };
};
