import { ActionPanel, List } from '@raycast/api';
import { TodoItem as TodoItemType, TodoSection } from '../core/types';
import { CHECKED_ICON, UNCHECKED_ICON } from '../constants';
import { TodoDetail } from './TodoDetail';
import { ItemActionHandlers, ItemActions } from '../actions/ItemActions';

type Props = {
  item: TodoItemType;
  id: string;
  parentSection: TodoSection;
  actionHandlers: ItemActionHandlers;
  additionalActions?: React.ReactNode;
};

export const TodoListItem = ({
  item,
  id,
  parentSection,
  actionHandlers,
  additionalActions,
}: Props) => {
  return (
    <List.Item
      key={id}
      id={id}
      icon={item.checked ? CHECKED_ICON : UNCHECKED_ICON}
      title={item.content}
      detail={<TodoDetail item={item} parentSection={parentSection} />}
      actions={
        <ActionPanel>
          <ItemActions item={item} actionHandlers={actionHandlers} />
          {additionalActions}
        </ActionPanel>
      }
    />
  );
};
