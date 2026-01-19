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
import { ItemUUID, SectionUUID, TodoItem, TodoSection } from './core/types';
import { TodoListHistoryView } from './components/TodoListHistoryView';

const ViewTodo = (props: LaunchProps<{ arguments: Arguments.ViewTodo }>) => {
  const [showDetail, setShowDetail] = useState(true); // TODO: remember state using cache
  const [hardFocusedItem, setHardFocusedItem] = useState<string | null>(null);

  const {
    sections,
    allTags,
    canUndo,
    canRedo,
    name,

    revaluate,
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
    setFocusedItem,
  } = useTodo(props.arguments.name);

  const { push, pop } = useNavigation();

  const [filter, setFilter] = useState<TodoFilter>('all');

  const onUpdate = (item: TodoItem) => {
    push(
      <EditTodoView
        initialTodoItem={item}
        availableTags={allTags}
        onSubmit={async (updatedItem) => {
          await updateItem(updatedItem, item.id);
          showToast(Toast.Style.Success, 'Item Updated');
          pop();
        }}
      />,
      () => {
        setHardFocusedItem(item.id);
      }
    );
  };

  const onAdd = async (
    at:
      | { itemId: ItemUUID; mode: 'before' | 'after' }
      | { sectionId: SectionUUID }
  ) => {
    const item = createItem();

    push(
      <EditTodoView
        initialTodoItem={item}
        availableTags={allTags}
        onSubmit={async (item) => {
          await addItem(item, at);
          showToast(Toast.Style.Success, 'Item Added');
          pop();
        }}
      />,
      () => {
        setTimeout(() => setHardFocusedItem(item.id), 100);
      }
    );
  };

  const onMove = async (itemId: ItemUUID, direction: 'up' | 'down') => {
    await moveItem(itemId, direction);

    setHardFocusedItem(itemId);
  };

  const onEditSection = (section: TodoSection) => {
    push(
      <EditSectionView
        initialSection={section}
        onSubmit={(updatedSection) => {
          updateSection(updatedSection, { sectionId: section.id });
          showToast(Toast.Style.Success, 'Section Updated');
          pop();
        }}
      />
    );
  };

  const onAddSection = async (itemId: ItemUUID) => {
    const section = createSection({ name: 'New Section' });

    push(
      <EditSectionView
        initialSection={section}
        onSubmit={async (section) => {
          await addSection(section, itemId);
          showToast(Toast.Style.Success, 'Section Added');
          pop();
        }}
      />
    );
  };

  const onUndo = async () => {
    try {
      const result = await undo();
      showToast(Toast.Style.Success, 'Action Undone');

      if (result?.focusedItem) {
        setTimeout(() => {
          setHardFocusedItem(result.focusedItem);
        }, 100);
      }
    } catch (error) {
      console.error(error);
      // NOTE: no distinction between error and no history
      showToast(Toast.Style.Failure, 'Nothing to undo');
    }
  };

  const onRedo = async () => {
    try {
      const result = await redo();
      showToast(Toast.Style.Success, 'Action Redone');

      if (result?.focusedItem) {
        setTimeout(() => {
          setHardFocusedItem(result.focusedItem);
        }, 100);
      }
    } catch (error) {
      console.error(error);
      // NOTE: no distinction between error and no history
      showToast(Toast.Style.Failure, 'Nothing to redo');
    }
  };

  const onToggle = async (item: TodoItem) => {
    const checked = !item.checked;
    await toggleItem(item.id);
    if (checked) {
      showToast(Toast.Style.Success, 'Item Completed');
    }
  };

  const viewHistory = () => {
    if (!name) return;
    push(
      <TodoListHistoryView
        name={name}
        onRestore={(entry) => {
          pop();
          showToast(
            Toast.Style.Success,
            'Restored todo list to' + new Date(entry.dateTime).toLocaleString()
          );
          revaluate();
        }}
      />
    );
  };

  const getListActions = useCallback(
    (item: TodoItem | null, section: TodoSection) => (
      <ListActions
        showDetail={showDetail}
        actionHandlers={{
          onAdd: item ? (mode) => onAdd({ itemId: item.id, mode }) : undefined,
          onAddSection: item ? () => onAddSection(item.id) : undefined, // NOTE: section can now not be added from empty sections
          onEditSection: () => onEditSection(section),
          removeSection: (keepItems: boolean) =>
            removeSection(section.id, keepItems), // TODO: does this allow deleting the last section?
          undo: canUndo ? onUndo : undefined,
          redo: canRedo ? onRedo : undefined,
          revaluate,
          clearHistory,
          viewHistory,
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
      selectedItemId={hardFocusedItem ?? undefined}
      filtering={{ keepSectionOrder: true }}
      searchBarAccessory={
        <ItemFilters defaultFilter={filter} filterChanged={setFilter} />
      }
      onSelectionChange={(id) => setFocusedItem(id as ItemUUID)}
    >
      {sections?.map((section, sectionIndex) => (
        <List.Section
          key={section.id}
          title={section.name}
          subtitle={section.name ? section.items.length.toString() : undefined}
        >
          {filterItems(section.items, filter).map((item) => (
            <TodoListItem
              id={item.id}
              key={item.id}
              item={item}
              parentSection={section}
              actionHandlers={{
                // NOTE: move does not work when filtering is applied
                onMove:
                  // NOTE: Only allow reordering when not filtering
                  filter === 'all'
                    ? (direction) => onMove(item.id, direction)
                    : undefined,
                onUpdate: () => onUpdate(item),
                removeItem: () => removeItem(item.id),
                toggleItem: () => onToggle(item),
              }}
              additionalActions={getListActions(item, section)}
            />
          ))}
          {(sectionIndex === sections.length - 1 || !section.items.length) && (
            <AddNewListItem
              sectionId={section.id}
              actionHandlers={{
                onAdd: () =>
                  onAdd({
                    sectionId: section.id,
                  }),
              }}
              additionalActions={getListActions(null, section)}
            />
          )}
        </List.Section>
      ))}
    </List>
  );
};

export default ViewTodo;
