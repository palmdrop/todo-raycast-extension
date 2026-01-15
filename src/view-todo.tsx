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

const ViewTodo = (props: LaunchProps<{ arguments: Arguments.ViewTodo }>) => {
  const {
    sections,
    canUndo,
    canRedo,

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
  } = useTodo(props.arguments.name);

  const { push, pop } = useNavigation();

  const [showDetail, setShowDetail] = useState(true); // TODO: remember state using cache
  const [focusedItem, setFocusedItem] = useState<string | undefined>(undefined);

  const [filter, setFilter] = useState<TodoFilter>('all');

  const onUpdate = (item: TodoItem) => {
    push(
      <EditTodoView
        initialTodoItem={item}
        onSubmit={(updatedItem) => {
          updateItem(updatedItem, item.id);
          pop();
        }}
      />
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
        onSubmit={(item) => {
          addItem(item, at);

          setTimeout(() => {
            setFocusedItem(item.id);
          }, 50);

          pop();
        }}
      />
    );
  };

  const onMove = async (itemId: ItemUUID, direction: 'up' | 'down') => {
    await moveItem(itemId, direction);

    // NOTE: this "fixes" is a weird race condition that prevents update order issues...
    // NOTE: does this work at all anymore?
    setTimeout(() => {
      // NOTE: I think I need to set a better key for the todos
      setFocusedItem(itemId);
    }, 10);
  };

  const onEditSection = (section: TodoSection) => {
    push(
      <EditSectionView
        initialSection={section}
        onSubmit={(updatedSection) => {
          updateSection(updatedSection, { sectionId: section.id });
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
                toggleItem: () => toggleItem(item.id),
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
