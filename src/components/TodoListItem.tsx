import { ActionPanel, List } from '@raycast/api';
import { TodoItem as TodoItemType, TodoSection } from '../core/types';
import { TodoDetail } from './TodoDetail';
import { ItemActionHandlers, ItemActions } from '../actions/ItemActions';
import { getCurrentStatusIcon } from '../utils/indicators';

type Props = {
  item: TodoItemType;
  id: string;
  parentSection: TodoSection;
  actionHandlers: ItemActionHandlers;
  additionalActions?: React.ReactNode;
};

const MATCH_SPACE_OR_NEWLINE = /[\s\n]+/;

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
      icon={getCurrentStatusIcon(item.status)}
      title={item.content}
      keywords={[
        ...(item.description ?? '').split(MATCH_SPACE_OR_NEWLINE),
        ...item.tags,
      ]}
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
