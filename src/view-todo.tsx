import {
  Action,
  ActionPanel,
  Color,
  Icon,
  Keyboard,
  LaunchProps,
  List,
  showToast,
  Toast,
  useNavigation,
} from '@raycast/api';
import { useTodo } from './todo/useTodo';
import { useState } from 'react';
import { TodoItem } from './core/types';
import { EditTodoView } from './components/EditTodoView';

const checkedIcon = {
  source: Icon.CircleFilled,
  tintColor: Color.Green,
};

const uncheckedIcon = {
  source: Icon.Circle,
  tintColor: Color.Red,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getTodoMarkdown = (item: TodoItem) => {
  // return `# ${item.content}`;
  return undefined;
};

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
    addItem,
    moveItem,
  } = useTodo(props.arguments.name);

  const { push, pop } = useNavigation();

  const [showDetail, setShowDetail] = useState(true); // TODO: remember state using cache
  const [focusedItem, setFocusedItem] = useState<string | undefined>(undefined);

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
    // const newIndex = itemIndex + (direction === 'up' ? -1 : 1);
    // if (newIndex < 0 || newIndex >= (todoItems?.length ?? 0)) return;

    // swapItems(itemIndex, newIndex);
    const newIndices = await moveItem(itemIndex, sectionIndex, direction);
    if (!newIndices) {
      showToast(Toast.Style.Failure, 'Failed to move item');
      return;
    }

    setFocusedItem(getItemKey(newIndices.itemIndex, newIndices.sectionIndex));
  };

  return (
    <List isShowingDetail={showDetail} selectedItemId={focusedItem}>
      {sections?.map((section, sectionIndex) => (
        <List.Section
          key={sectionIndex}
          title={section.name ?? 'Todo Items'}
          subtitle={section.items.length.toString()}
        >
          {section.items?.map((item, itemIndex) => (
            <List.Item
              key={getItemKey(itemIndex, sectionIndex)} // TODO: better key?
              id={getItemKey(itemIndex, sectionIndex)}
              icon={item.checked ? checkedIcon : uncheckedIcon}
              title={item.content}
              detail={
                <List.Item.Detail
                  markdown={getTodoMarkdown(item)}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label
                        title="Todo"
                        text={item.content}
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Status"
                        text={item.checked ? 'Complete' : 'Incomplete'}
                        icon={item.checked ? checkedIcon : uncheckedIcon}
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Description"
                        text={item.description}
                      />
                      <List.Item.Detail.Metadata.Separator />
                      {item.due && (
                        <List.Item.Detail.Metadata.Label
                          title="Due Date"
                          text={item.due?.toLocaleString()}
                        />
                      )}
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Item actions">
                    <Action
                      title={item.checked ? 'Uncheck' : 'Check'}
                      onAction={() => toggleItem(itemIndex, sectionIndex)}
                      icon={!item.checked ? Icon.Check : Icon.Xmark}
                    />
                    <Action
                      title="Edit"
                      onAction={() => onUpdate(itemIndex, sectionIndex)}
                      icon={Icon.Pencil}
                      shortcut={Keyboard.Shortcut.Common.Edit}
                    />
                    <Action
                      title="Delete"
                      onAction={() => removeItem(itemIndex, sectionIndex)}
                      icon={Icon.Trash}
                      shortcut={Keyboard.Shortcut.Common.Remove}
                    />
                    <Action
                      title="Move Up"
                      onAction={() => onMove(itemIndex, sectionIndex, 'up')}
                      icon={Icon.ArrowUp}
                      shortcut={Keyboard.Shortcut.Common.MoveUp}
                    />
                    <Action
                      title="Move Down"
                      onAction={() => onMove(itemIndex, sectionIndex, 'down')}
                      icon={Icon.ArrowDown}
                      shortcut={Keyboard.Shortcut.Common.MoveDown}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="List actions">
                    <Action
                      title="Add Item"
                      onAction={() => onAdd(itemIndex, sectionIndex, true)}
                      icon={Icon.Plus}
                      shortcut={Keyboard.Shortcut.Common.New}
                    />
                    <Action
                      title="Add Item Before"
                      onAction={() => onAdd(itemIndex, sectionIndex, false)}
                      icon={Icon.Plus}
                    />
                    <Action
                      title="Add Item After"
                      onAction={() => onAdd(itemIndex, sectionIndex, true)}
                      icon={Icon.Plus}
                    />
                    <Action
                      title="Show Details"
                      onAction={() =>
                        setShowDetail((showDetail) => !showDetail)
                      }
                      icon={showDetail ? Icon.EyeDisabled : Icon.Eye}
                      shortcut={Keyboard.Shortcut.Common.Open}
                    />
                    <Action
                      title="Refresh"
                      onAction={revaluate}
                      icon={Icon.ArrowClockwise}
                      shortcut={Keyboard.Shortcut.Common.Refresh}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
};

export default ViewTodo;
