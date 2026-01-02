import {
  ActionPanel,
  List,
  Action,
  Icon,
  openExtensionPreferences,
} from '@raycast/api';
import { listTodoLists, removeTodoList } from './backend/data';
import { useCachedPromise } from '@raycast/utils';

export default function Command() {
  const todos = useCachedPromise(listTodoLists);

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
