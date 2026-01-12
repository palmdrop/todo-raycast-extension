import {
  LaunchProps,
  List,
  showToast,
  Toast,
  useNavigation,
} from '@raycast/api';
import { useCallback, useState } from 'react';
import { useTodo } from './hooks/useTodo';
import { EditTodoView } from './components/EditTodoView';
import { EditSectionView } from './components/EditSectionView';
import { TodoListItem } from './components/TodoListItem';
import { ListActions } from './actions/ListActions';
import { AddNewListItem } from './components/AddNewListItem';
import { filterItems, TodoFilter } from './core/filters';
import { ItemFilters } from './components/ItemFilters';

const getItemKey = (itemIndex: number, sectionIndex: number) => {
  return `${itemIndex}-${sectionIndex}`;
};

const ViewTodo = (props: LaunchProps<{ arguments: Arguments.ViewTodo }>) => {
  const {
    sections,
    canUndo,
    canRedo,

    revaluate,
    getItem,
    toggleItem,
    updateItem,
    removeItem,
    createItem,
    createSection,
    addItem,
    moveItem,
    updateSection,
    addSection,
    removeSection,
    undo,
    redo,
    clearHistory,
  } = useTodo(props.arguments.name);

  const { push, pop } = useNavigation();

  const [showDetail, setShowDetail] = useState(true); // TODO: remember state using cache
  const [focusedItem, setFocusedItem] = useState<string | undefined>(undefined);

  const [filter, setFilter] = useState<TodoFilter>('all');

  const onUpdate = (itemIndex: number, sectionIndex = 0) => {
    const item = getItem(itemIndex, sectionIndex);

    if (!item) {
      showToast(Toast.Style.Failure, 'Item not found');
      return;
    }

    push(
      <EditTodoView
        initialTodoItem={item}
        onSubmit={(item) => {
          updateItem(item, itemIndex, sectionIndex);
          pop();
        }}
      />
    );
  };

  const onAdd = async (
    itemIndex: number,
    sectionIndex: number,
    after: boolean
  ) => {
    const item = await createItem();

    push(
      <EditTodoView
        initialTodoItem={item}
        onSubmit={(item) => {
          addItem(item, itemIndex, sectionIndex, after);

          if (after) {
            setFocusedItem((itemIndex + 1).toString());
          }

          pop();
        }}
      />
    );
  };

  const onMove = async (
    itemIndex: number,
    sectionIndex: number,
    direction: 'up' | 'down'
  ) => {
    const newIndices = await moveItem(itemIndex, sectionIndex, direction);
    if (!newIndices) {
      showToast(Toast.Style.Failure, 'Failed to move item');
      return;
    }

    // NOTE: this "fixes" is a weird race condition that prevents update order issues...
    setTimeout(() => {
      // NOTE: I think I need to set a better key for the todos
      setFocusedItem(getItemKey(newIndices.itemIndex, newIndices.sectionIndex));
    }, 10);
  };

  const onEditSection = (sectionIndex: number) => {
    if (!sections || sectionIndex < 0 || sectionIndex >= sections.length)
      return;

    push(
      <EditSectionView
        initialSection={sections[sectionIndex]}
        onSubmit={(section) => {
          updateSection(section, sectionIndex);
          pop();
        }}
      />
    );
  };

  const onAddSection = async (sectionIndex: number, itemIndex: number) => {
    if (!sections || sectionIndex < 0 || sectionIndex >= sections.length) {
      return;
    }

    const section = await createSection({ name: 'New Section' });

    push(
      <EditSectionView
        initialSection={section}
        onSubmit={async (section) => {
          await addSection(section, sectionIndex, itemIndex);
          pop();
        }}
      />
    );
  };

  const onUndo = async () => {
    try {
      await undo();
    } catch (error) {
      console.error(error);
      // NOTE: no distinction between error and no history
      showToast(Toast.Style.Failure, 'Nothing to undo');
    }
  };

  const onRedo = async () => {
    try {
      await redo();
    } catch (error) {
      console.error(error);
      // NOTE: no distinction between error and no history
      showToast(Toast.Style.Failure, 'Nothing to redo');
    }
  };

  const getListActions = useCallback(
    (itemIndex: number, sectionIndex: number, sectionName?: string) => (
      <ListActions
        showDetail={showDetail}
        actionHandlers={{
          onAdd: () => onAdd(itemIndex, sectionIndex, false),
          onAddSection: () => onAddSection(sectionIndex, itemIndex),
          onEditSection: () => onEditSection(sectionIndex),
          removeSection:
            sectionIndex > 0 || sectionName
              ? (keepItems: boolean) => removeSection(sectionIndex, keepItems)
              : undefined,
          undo: canUndo ? onUndo : undefined,
          redo: canRedo ? onRedo : undefined,
          revaluate,
          clearHistory,
          setShowDetail,
        }}
      />
    ),
    [
      showDetail,
      onAdd,
      onAddSection,
      onEditSection,
      removeSection,
      undo,
      redo,
      canRedo,
      canUndo,
      revaluate,
      clearHistory,
      setShowDetail,
    ]
  );

  return (
    <List
      isShowingDetail={showDetail}
      selectedItemId={focusedItem}
      filtering={{ keepSectionOrder: true }}
      searchBarAccessory={
        <ItemFilters defaultFilter={filter} filterChanged={setFilter} />
      }
    >
      {sections?.map((section, sectionIndex) => (
        <List.Section
          key={sectionIndex}
          title={section.name}
          subtitle={section.name ? section.items.length.toString() : undefined}
        >
          {filterItems(section.items, filter).map((item, itemIndex) => (
            <TodoListItem
              id={getItemKey(itemIndex, sectionIndex)}
              key={getItemKey(itemIndex, sectionIndex)}
              item={item}
              parentSection={section}
              actionHandlers={{
                // NOTE: move does not work when filtering is applied
                onMove:
                  // NOTE: Only allow reordering when not filtering
                  filter === 'all'
                    ? (direction) => onMove(itemIndex, sectionIndex, direction)
                    : undefined,
                onUpdate: () => onUpdate(itemIndex, sectionIndex),
                removeItem: () => removeItem(itemIndex, sectionIndex),
                toggleItem: () => toggleItem(itemIndex, sectionIndex),
              }}
              additionalActions={getListActions(
                itemIndex,
                sectionIndex,
                section.name
              )}
            />
          ))}
          {(sectionIndex === sections.length - 1 || !section.items.length) && (
            <AddNewListItem
              sectionIndex={sectionIndex}
              actionHandlers={{
                onAdd: (sectionIndex) =>
                  onAdd(
                    section?.items?.length ? section.items.length - 1 : 0,
                    sectionIndex,
                    true
                  ),
              }}
              additionalActions={getListActions(0, sectionIndex, section.name)}
            />
          )}
        </List.Section>
      ))}
    </List>
  );
};

export default ViewTodo;
