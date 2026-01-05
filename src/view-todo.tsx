import {
  Action,
  ActionPanel,
  Color,
  Icon,
  LaunchProps,
  List,
} from '@raycast/api';
import { useTodo } from './todo/useTodo';

const checkedIcon = {
  source: Icon.CircleFilled,
  tintColor: Color.Green,
};

const uncheckedIcon = {
  source: Icon.Circle,
  tintColor: Color.Red,
};

const ViewTodo = (props: LaunchProps<{ arguments: Arguments.ViewTodo }>) => {
  const { items: todoItems, toggleItem } = useTodo(props.arguments.name);

  return (
    <List>
      {todoItems?.map((item, i) => (
        <List.Item
          key={i} // TODO: better key?
          icon={item.checked ? checkedIcon : uncheckedIcon}
          title={item.content}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action
                  title={item.checked ? 'Uncheck' : 'Check'}
                  onAction={() => toggleItem(i)}
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
