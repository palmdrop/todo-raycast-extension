import {
  Action,
  ActionPanel,
  Color,
  Icon,
  Keyboard,
  LaunchProps,
  List,
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

const ViewTodo = (props: LaunchProps<{ arguments: Arguments.ViewTodo }>) => {
  const {
    revaluate,
    items: todoItems,
    toggleItem,
    updateItem,
    removeItem,
    createItem,
    addItem,
    swapItems,
  } = useTodo(props.arguments.name);

  const { push, pop } = useNavigation();

  const [showDetail, setShowDetail] = useState(true); // TODO: remember state using cache
  const [focusedItem, setFocusedItem] = useState<string | undefined>(undefined);

  const onUpdate = (index: number) => {
    const item = todoItems?.[index];
    push(
      <EditTodoView
        initialTodoItem={item}
        onSubmit={(item) => {
          updateItem(item, index);
          pop();
        }}
      />
    );
  };

  const onAdd = async (index: number, after: boolean) => {
    const item = await createItem();
    push(
      <EditTodoView
        initialTodoItem={item}
        onSubmit={(item) => {
          addItem(item, index, after);

          if (after) {
            setFocusedItem((index + 1).toString());
          }

          pop();
        }}
      />
    );
  };

  const onMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = index + (direction === 'up' ? -1 : 1);
    if (newIndex < 0 || newIndex >= (todoItems?.length ?? 0)) return;

    swapItems(index, newIndex);
    setFocusedItem(newIndex.toString());
  };

  return (
    <List isShowingDetail={showDetail} selectedItemId={focusedItem}>
      {todoItems?.map((item, i) => (
        <List.Item
          key={i} // TODO: better key?
          id={i.toString()}
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
                  onAction={() => toggleItem(i)}
                  icon={!item.checked ? Icon.Check : Icon.Xmark}
                />
                <Action
                  title="Edit"
                  onAction={() => onUpdate(i)}
                  icon={Icon.Pencil}
                  shortcut={Keyboard.Shortcut.Common.Edit}
                />
                <Action
                  title="Delete"
                  onAction={() => removeItem(i)}
                  icon={Icon.Trash}
                  shortcut={Keyboard.Shortcut.Common.Remove}
                />
                {i > 0 && (
                  <Action
                    title="Move Up"
                    onAction={() => onMove(i, 'up')}
                    icon={Icon.ArrowUp}
                    shortcut={Keyboard.Shortcut.Common.MoveUp}
                  />
                )}
                {i < todoItems.length - 1 && (
                  <Action
                    title="Move Down"
                    onAction={() => onMove(i, 'down')}
                    icon={Icon.ArrowDown}
                    shortcut={Keyboard.Shortcut.Common.MoveDown}
                  />
                )}
              </ActionPanel.Section>
              <ActionPanel.Section title="List actions">
                <Action
                  title="Add Item"
                  onAction={() => onAdd(i, true)}
                  icon={Icon.Plus}
                  shortcut={Keyboard.Shortcut.Common.New}
                />
                <Action
                  title="Add Item Before"
                  onAction={() => onAdd(i, false)}
                  icon={Icon.Plus}
                />
                <Action
                  title="Add Item After"
                  onAction={() => onAdd(i, true)}
                  icon={Icon.Plus}
                />
                <Action
                  title="Show Details"
                  onAction={() => setShowDetail((showDetail) => !showDetail)}
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
    </List>
  );
};

export default ViewTodo;
