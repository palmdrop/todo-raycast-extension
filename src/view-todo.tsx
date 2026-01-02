import { Action, ActionPanel, Color, Icon, List } from '@raycast/api';
import * as backend from './backend'; // TODO: rename to "core"
import { useEffect, useState } from 'react';
import { TodoItem } from './backend/types';
import { debounce } from './utils/debounce';

const checkedIcon = {
  source: Icon.CircleFilled,
  tintColor: Color.Green,
};

const uncheckedIcon = {
  source: Icon.Circle,
  tintColor: Color.Red,
};

// TODO: make abortable
const read = async (name: string) => {
  return await backend.getTodoItems(name);
};

const write = async (name: string, todoItems: TodoItem[]) => {
  return await backend.updateTodoItems(name, todoItems);
};

const writeDebounced = debounce(write, 1000);

const ViewTodo = () => {
  const name = 'working memory todo';
  const [todoItems, setTodoItems] = useState<TodoItem[]>();

  const toggleChecked = (index: number) => {
    if (!todoItems) return;

    if (todoItems.length <= index) {
      throw new Error('No todo item at index ' + index);
    }

    setTodoItems((items) => {
      if (!items) return undefined;

      const newItems = items.map((item, i) =>
        index !== i
          ? item
          : {
              ...item,
              checked: !item.checked,
            }
      );

      writeDebounced(name, newItems);

      return newItems;
    });
  };

  useEffect(() => {
    let aborted = false;

    read(name).then((items) => {
      if (aborted) return;
      setTodoItems(items);
    });

    return () => {
      aborted = true;
      writeDebounced.cancel();

      if (!todoItems) return;
      write(name, todoItems);
    };
  }, [name]);

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
                  onAction={() => toggleChecked(i)}
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
