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
import * as core from './core';
import { useCachedPromise, useFrecencySorting } from '@raycast/utils';
import ViewTodo from './view-todo';
import { useState } from 'react';
import { removeFrontmatter } from './core/markdown';
import { collectTodoListMetadata } from './utils/metadata';

export default function Command() {
  const [focusedList, setFocusedList] = useState<string | null>(null);
  const { push } = useNavigation();

  const todos = useCachedPromise(listTodoLists);

  const { data: sortedTodos, visitItem } = useFrecencySorting(todos.data, {
    key: (todo) => todo.name,
  });

  const getTodoListInfo = async (name: string | null) => {
    if (!name) return undefined;

    const todoList = await core.getTodoList(name, false);

    const metadata = collectTodoListMetadata(todoList);

    return {
      name,
      markdown: removeFrontmatter(todoList.data.content),
      sections: todoList.sections,
      ...metadata,
    };
  };

  const listInfo = useCachedPromise(getTodoListInfo, [focusedList]);

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
      isShowingDetail={true}
      onSelectionChange={setFocusedList}
    >
      {sortedTodos?.map((todo) => (
        <List.Item
          id={todo.name}
          key={todo.name}
          title={todo.name}
          icon={Icon.Ticket}
          detail={
            <List.Item.Detail
              markdown={listInfo.data?.markdown ?? ''}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Name"
                    text={todo.name}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="File"
                    text={todo.filePath}
                  />
                  {listInfo.data && (
                    <>
                      <List.Item.Detail.Metadata.Label
                        title="Number of sections"
                        text={listInfo.data.sections.length.toString()}
                      />
                      <List.Item.Detail.Metadata.Label
                        title={`Items (completed/total${listInfo.data.invalidCount ? ` [${listInfo.data.invalidCount}])` : ')'}`}
                        text={`${listInfo.data.checkedCount}/${listInfo.data.numberOfItems}${listInfo.data.invalidCount ? `[${listInfo.data.invalidCount}]` : ''}`}
                      />
                    </>
                  )}
                </List.Item.Detail.Metadata>
              }
            ></List.Item.Detail>
          }
          actions={
            <ActionPanel>
              <Action
                title="View Todo List"
                icon={Icon.Document}
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
                title="Register New Todo List"
                icon={Icon.NewDocument}
                onAction={() => {
                  launchCommand({
                    name: 'add-todo',
                    type: LaunchType.UserInitiated,
                  });
                }}
              />
              <Action
                title="Unregister Todo List"
                icon={Icon.DeleteDocument}
                style={Action.Style.Destructive}
                onAction={async () => {
                  await removeTodoList(todo.name);
                  todos.revalidate();
                }}
              />
              <Action.Open
                title="Open File"
                icon={Icon.Folder}
                target={todo.filePath}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
