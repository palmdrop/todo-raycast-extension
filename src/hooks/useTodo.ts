import { useCallback, useEffect, useMemo, useState } from 'react';
import { ItemUUID, SectionUUID, TodoItem, TodoSection } from '../core/types';
import * as core from '../core';
import { popToRoot, showToast, Toast } from '@raycast/api';
import { createItem, createSection } from '../core/utils';
import { wrap } from '../utils/wrap';

type ItemLookupMap = Map<
  ItemUUID,
  {
    item: TodoItem;
    itemIndex: number;
    parentSection: TodoSection;
    parentSectionIndex: number;
  }
>;
type SectionLookupMap = Map<
  SectionUUID,
  { section: TodoSection; sectionIndex: number }
>;

export const useTodo = (initialName?: string) => {
  const [name, setName] = useState(initialName);
  const [focusedItem, setFocusedItem] = useState<ItemUUID | null>(null);
  const [todoSections, setTodoSections] = useState<TodoSection[] | null>(null);
  const allTags = useMemo(() => {
    if (!todoSections) return [];
    const tags = new Set<string>(
      todoSections
        .flatMap((section) => section.items)
        .flatMap((item) => item.tags)
    );

    return Array.from(tags);
  }, [todoSections]);

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

  const init = useMemo(() => {
    let isRunning = false;
    const init = async (name?: string) => {
      isRunning = true;
      try {
        if (!name || init.aborted) return;

        const { sections } = await core.getTodoList(name, true);
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
      if (!name) return;
      return await core.updateTodoItems(name, todoSections, focusedItem);
    },
    [name, focusedItem]
  );

  const update = useMemo(() => {
    const itemLookup = new Map(
      todoSections?.flatMap((section, sectionIndex) =>
        section.items.map((item, itemIndex) => [
          item.id,
          {
            item,
            itemIndex,
            parentSection: section,
            parentSectionIndex: sectionIndex,
          },
        ])
      ) ?? []
    );

    const sectionLookup = new Map(
      todoSections?.map((section, sectionIndex) => [
        section.id,
        { section, sectionIndex },
      ]) ?? []
    );

    return async (
      sections:
        | TodoSection[]
        | ((
            current: TodoSection[] | null,
            itemLookup: ItemLookupMap,
            sectionLookup: SectionLookupMap
          ) => TodoSection[])
    ) => {
      const newSections =
        typeof sections === 'function'
          ? sections(todoSections, itemLookup, sectionLookup)
          : sections;

      await commit(newSections);
      // revaluate();
      setTodoSections(newSections);
    };
  }, [commit, revaluate, todoSections]);

  const updateSection = useCallback(
    (
      section:
        | TodoSection
        | ((
            previousSection: TodoSection,
            itemLookup: ItemLookupMap,
            sectionIndex: number
          ) => TodoSection | null),
      id: { sectionId: SectionUUID } | { itemId: ItemUUID }
    ) => {
      return update((previousSections, itemLookup, sectionLookup) => {
        if (!previousSections) return [];

        let sectionId: SectionUUID | undefined = (
          id as { sectionId: SectionUUID }
        ).sectionId;

        if (!sectionId) {
          sectionId = itemLookup.get((id as { itemId: ItemUUID }).itemId)
            ?.parentSection.id;

          if (!sectionId) {
            throw new Error('Item does not belong to a section.');
          }
        }

        const sectionData = sectionLookup.get(sectionId);
        if (!sectionData) {
          throw new Error('No section with ID ' + id);
        }

        const newSection =
          typeof section === 'function'
            ? section(sectionData.section, itemLookup, sectionData.sectionIndex)
            : section;

        // Disallow deleting the last section
        if (!newSection && previousSections.length === 1) {
          return previousSections;
        }

        return [
          ...previousSections.slice(0, sectionData.sectionIndex),
          ...(newSection ? [newSection] : []),
          ...previousSections.slice(sectionData.sectionIndex + 1),
        ];
      });
    },
    [update]
  );

  const updateItem = useCallback(
    (
      item: Partial<TodoItem> | ((item: TodoItem) => Partial<TodoItem>),
      id: ItemUUID
    ) => {
      return updateSection(
        (previousSection, itemLookup) => {
          const itemData = itemLookup.get(id);

          if (!itemData) {
            throw new Error('No todo item with ID ' + id);
          }

          const { item: previousItem, itemIndex } = itemData;

          const newSection = {
            ...previousSection,
            items: [
              ...previousSection.items.slice(0, itemIndex),
              {
                ...previousItem,
                ...(typeof item === 'function' ? item(previousItem) : item),
                id: previousItem.id,
              },
              ...previousSection.items.slice(itemIndex + 1),
            ],
          };

          return newSection;
        },
        { itemId: id }
      );
    },
    [update]
  );

  const toggleItem = useCallback(
    (id: ItemUUID) => {
      return updateItem(
        (item) => ({
          ...item,
          checked: !item.checked,
        }),
        id
      );
    },
    [update]
  );

  const removeItem = useCallback(
    (id: ItemUUID) => {
      // NOTE: does nothing if item does not exist
      return updateSection(
        (previousSection, _, sectionIndex) => {
          const newItems = previousSection.items.filter(
            (item) => item.id !== id
          );

          // If the section is empty, unnamed and it is the first section, remove it.
          if (
            !previousSection.name &&
            sectionIndex === 0 &&
            newItems.length === 0
          ) {
            return null;
          }

          return {
            ...previousSection,
            items: newItems,
          };
        },
        { itemId: id }
      );
    },
    [update]
  );

  const addItem = useCallback(
    (
      item: TodoItem,
      at:
        | { itemId: ItemUUID; mode?: 'before' | 'after' }
        | { sectionId: SectionUUID; mode?: 'first' | 'last' }
    ) => {
      return updateSection((previousSection, itemLookup) => {
        if ('sectionId' in at) {
          const mode = at.mode || 'last';
          return {
            ...previousSection,
            items: [
              ...(mode === 'first' ? [] : previousSection.items),
              item,
              ...(mode === 'last' ? [] : previousSection.items),
            ],
          };
        }

        const itemData = itemLookup.get(at.itemId);

        if (!itemData) {
          throw new Error('No item with ID ' + at.itemId);
        }

        if (itemData.parentSection.id !== previousSection.id) {
          throw new Error('Item does not belong to this section');
        }

        const newItems = [...previousSection.items];
        newItems.splice(
          itemData.itemIndex + (at.mode === 'after' ? 1 : 0),
          0,
          item
        );

        return {
          ...previousSection,
          items: newItems,
        };
      }, at);
    },
    [update]
  );

  const swap = useCallback(
    (
      itemId1: ItemUUID,
      itemId2: ItemUUID,
      previousSections: TodoSection[],
      itemLookup: ItemLookupMap
    ) => {
      const itemData1 = itemLookup.get(itemId1);
      const itemData2 = itemLookup.get(itemId2);

      if (!itemData1) {
        throw new Error('No item with ID ' + itemId1);
      }

      if (!itemData2) {
        throw new Error('No item with ID ' + itemId2);
      }

      const newSections = [...previousSections];

      const section1 = itemData1.parentSection;
      const section2 = itemData2.parentSection;

      const itemA = section1.items[itemData1.itemIndex];
      const itemB = section2.items[itemData2.itemIndex];
      section1.items[itemData1.itemIndex] = itemB;
      section2.items[itemData2.itemIndex] = itemA;

      return newSections;
    },
    []
  );

  const swapItems = useCallback(
    (itemId1: ItemUUID, itemId2: ItemUUID) => {
      return update((previousSections, itemLookup) => {
        if (!previousSections) return [];
        return swap(itemId1, itemId2, previousSections, itemLookup);
      });
    },
    [update]
  );

  const moveItem = useCallback(
    (itemId: ItemUUID, direction: 'up' | 'down') => {
      return update((previousSections, itemLookup, sectionLookup) => {
        if (!previousSections) return [];

        const itemData = itemLookup.get(itemId);

        if (!itemData) {
          throw new Error('No item with ID ' + itemId);
        }

        const sectionData = sectionLookup.get(itemData.parentSection.id);

        if (!sectionData) {
          throw new Error('No section with ID ' + itemData.parentSection.id);
        }

        // Stays within the same section
        if (
          (direction === 'up' && itemData.itemIndex > 0) ||
          (direction === 'down' &&
            itemData.itemIndex < sectionData.section.items.length - 1)
        ) {
          const targetItemIndex = wrap(
            itemData.itemIndex + (direction === 'up' ? -1 : 1),
            0,
            sectionData.section.items.length
          );

          const targetItem = sectionData.section.items[targetItemIndex];
          return swap(
            itemData.item.id,
            targetItem.id,
            previousSections,
            itemLookup
          );
        }

        // Move to a (potentially) different section
        const targetSectionIndex = wrap(
          direction === 'up'
            ? sectionData.sectionIndex - 1
            : sectionData.sectionIndex + 1,
          0,
          previousSections.length
        );

        sectionData.section.items.splice(itemData.itemIndex, 1);

        const targetSection = previousSections[targetSectionIndex];
        if (direction === 'up') {
          targetSection.items.push(itemData.item);
        } else {
          targetSection.items.unshift(itemData.item);
        }

        return previousSections
          .map((section, index) => {
            if (index === targetSectionIndex) {
              return targetSection;
            }

            if (index === sectionData.sectionIndex) {
              // Delete empty, unnamed first section (but only if there are other sections)
              if (
                sectionData.sectionIndex === 0 &&
                section.items.length === 0 &&
                !section.name &&
                previousSections.length > 1
              ) {
                return null;
              }

              return sectionData.section;
            }

            return section;
          })
          .filter(Boolean) as TodoSection[];
      });
    },
    [swapItems, todoSections]
  );

  const addSection = useCallback(
    (section: TodoSection, insertAtTodoId: ItemUUID) => {
      return update((previousSections, itemLookup, sectionLookup) => {
        if (!previousSections) {
          return [section];
        }

        const todoData = itemLookup.get(insertAtTodoId);

        if (!todoData) {
          throw new Error('No item with ID ' + insertAtTodoId);
        }

        const sectionBefore = todoData.parentSection;
        const sectionData = sectionLookup.get(sectionBefore.id);

        if (!sectionData) {
          throw new Error('No section with ID ' + sectionBefore.id);
        }

        const itemsInNewSection = sectionBefore.items.slice(
          todoData.itemIndex + 1
        );

        sectionBefore.items = sectionBefore.items.slice(
          0,
          todoData.itemIndex + 1
        );

        section.items.push(...itemsInNewSection);

        return [
          ...previousSections.slice(0, sectionData.sectionIndex + 1),
          section,
          ...previousSections.slice(sectionData.sectionIndex + 1),
        ];
      });
    },
    [update]
  );

  const removeSection = useCallback(
    (sectionId: SectionUUID, keepItems?: boolean) => {
      return update((previousSections, _, sectionLookup) => {
        if (!previousSections) return [];

        const sectionData = sectionLookup.get(sectionId);

        if (!sectionData) {
          throw new Error('No section with ID ' + sectionId);
        }

        const newSections = [...previousSections];

        if (
          sectionData.sectionIndex === 0 &&
          (sectionData.section.items.length > 0 ||
            previousSections.length === 1)
        ) {
          // Default section needs to always exist, but name can be hidden.
          newSections[0].name = undefined;
          return newSections;
        }

        if (
          keepItems &&
          sectionData.sectionIndex > 0 &&
          sectionData.section.items.length > 0
        ) {
          const items = newSections[sectionData.sectionIndex].items;
          newSections[sectionData.sectionIndex - 1].items.push(...items);
        }

        newSections.splice(sectionData.sectionIndex, 1);

        return newSections;
      });
    },
    [update]
  );

  const undo = useCallback(async () => {
    if (!name) return;

    const restoredTodo = await core.undoTodoListChange(name);
    setTodoSections(restoredTodo.sections);

    return restoredTodo;
  }, [name, setTodoSections]);

  const redo = useCallback(async () => {
    if (!name) return;

    const restoredTodo = await core.redoTodoListChange(name);
    setTodoSections(restoredTodo.sections);

    return restoredTodo;
  }, [name, setTodoSections]);

  const clearHistory = useCallback(async () => {
    if (!name) return;

    await core.clearHistory(name);
  }, [name]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!name) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    let aborted = false;
    const updateCanUndoRedo = async () => {
      const { hasUndo, hasRedo } = await core.canUndoRedo(name);

      if (aborted) return;

      setCanUndo(hasUndo);
      setCanRedo(hasRedo);
    };

    updateCanUndoRedo();

    return () => {
      aborted = true;
    };
  }, [name, todoSections, setCanRedo, setCanUndo]);

  return {
    name,
    sections: todoSections,
    allTags,
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
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    setFocusedItem,
  };
};
