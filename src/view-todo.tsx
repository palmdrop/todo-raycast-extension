import {
  LaunchProps,
  List,
  showToast,
  Toast,
  useNavigation,
} from '@raycast/api';
import { useTodo } from './todo/useTodo';
import { useCallback, useState } from 'react';
import { TodoItem } from './core/types';
import { EditTodoView } from './components/EditTodoView';
import { EditSectionView } from './components/EditSectionView';
import { TodoListItem } from './components/TodoListItem';
import { ListActions } from './actions/ListActions';
import { AddNewListItem } from './components/AddNewListItem';

type TodoFilter = 'complete' | 'incomplete' | 'all';

const getItemKey = (itemIndex: number, sectionIndex: number) => {
  return `${itemIndex}-${sectionIndex}`;
};

const ViewTodo = (props: LaunchProps<{ arguments: Arguments.ViewTodo }>) => {
  const {
    revaluate,
    sections,
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
          updateItem(item, itemIndex);
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

    setFocusedItem(getItemKey(newIndices.itemIndex, newIndices.sectionIndex));
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

  const getListActions = useCallback(
    (itemIndex: number, sectionIndex: number) => (
      <ListActions
        showDetail={showDetail}
        itemIndex={itemIndex}
        sectionIndex={sectionIndex}
        actionHandlers={{
          onAdd,
          onAddSection,
          onEditSection,
          removeSection,
          revaluate,
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
      revaluate,
      setShowDetail,
    ]
  );

  const filterItems = (items?: TodoItem[]) => {
    if (!items) return [];

    return items.filter((item) => {
      switch (filter) {
        case 'all':
          return true;
        case 'complete':
          return item.checked;
        case 'incomplete':
          return !item.checked;
      }
    });
  };

  return (
    <List
      isShowingDetail={showDetail}
      selectedItemId={focusedItem}
      filtering={{ keepSectionOrder: true }}
      searchBarAccessory={
        <List.Dropdown
          storeValue={true}
          tooltip="Filter"
          value={filter}
          defaultValue="all"
          onChange={(value) => setFilter(value as TodoFilter)}
        >
          <List.Dropdown.Item title="All" value={'all'} />
          <List.Dropdown.Section title="Status">
            <List.Dropdown.Item title="Complete" value={'complete'} />
            <List.Dropdown.Item title="Incomplete" value={'incomplete'} />
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {sections?.map((section, sectionIndex) => (
        <List.Section
          key={sectionIndex}
          title={section.name}
          subtitle={section.name ? section.items.length.toString() : undefined}
        >
          {filterItems(section.items).map((item, itemIndex) => (
            <TodoListItem
              key={getItemKey(itemIndex, sectionIndex)}
              item={item}
              parentSection={section}
              itemIndex={itemIndex}
              sectionIndex={sectionIndex}
              actionHandlers={{
                // NOTE: this can be rewritten so that handlers do not need index! just pass an anonym func here with indices already wrapped
                onMove,
                onUpdate,
                removeItem,
                toggleItem,
              }}
              additionalActions={getListActions(itemIndex, sectionIndex)}
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
              additionalActions={getListActions(0, sectionIndex)}
            />
          )}
        </List.Section>
      ))}
    </List>
  );
};

export default ViewTodo;
