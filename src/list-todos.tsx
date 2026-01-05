import {
  ActionPanel,
  List,
  Action,
  Icon,
  openExtensionPreferences,
  useNavigation,
  LaunchType,
} from '@raycast/api';
import { listTodoLists, removeTodoList } from './core/data';
import { useCachedPromise } from '@raycast/utils';
import ViewTodo from './view-todo';

export default function Command() {
  const todos = useCachedPromise(listTodoLists);
  const { push } = useNavigation();

  return (
    <List
      actions={
        <ActionPanel>
          <Action
            title="Open Extension Preferences"
            onAction={openExtensionPreferences}
          />
        </ActionPanel>
      }
    >
      {todos?.data?.map((todo) => (
        <List.Item
          key={todo.name}
          title={todo.name}
          subtitle={todo.filePath}
          icon={Icon.Ticket}
          actions={
            <ActionPanel>
              <Action
                title="View Todo List"
                onAction={() => {
                  push(
                    <ViewTodo
                      arguments={{ name: todo.name }}
                      launchType={LaunchType.UserInitiated}
                    />
                  );
                }}
              />
              <Action
                title="Unregister Todo List"
                onAction={async () => {
                  await removeTodoList(todo.name);
                  todos.revalidate();
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
