import {
  ActionPanel,
  List,
  Action,
  Icon,
  openExtensionPreferences,
  useNavigation,
  LaunchType,
  launchCommand,
} from '@raycast/api';
import { listTodoLists, removeTodoList } from './core/data';
import { useCachedPromise, useFrecencySorting } from '@raycast/utils';
import ViewTodo from './view-todo';

export default function Command() {
  const todos = useCachedPromise(listTodoLists);
  const { data: sortedTodos, visitItem } = useFrecencySorting(todos.data, {
    key: (todo) => todo.name,
  });

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
      {sortedTodos?.map((todo) => (
        <List.Item
          key={todo.name}
          title={todo.name}
          subtitle={todo.filePath}
          icon={Icon.Ticket}
          actions={
            <ActionPanel>
              <Action
                title="View Todo List"
                onAction={async () => {
                  await visitItem(todo);
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
              <Action
                title="Register New Todo List"
                onAction={() => {
                  launchCommand({
                    name: 'add-todo',
                    type: LaunchType.UserInitiated,
                  });
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
