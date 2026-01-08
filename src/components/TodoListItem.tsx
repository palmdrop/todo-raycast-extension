import { ActionPanel, List } from '@raycast/api';
import { TodoItem as TodoItemType, TodoSection } from '../core/types';
import { CHECKED_ICON, UNCHECKED_ICON } from '../constants';
import { TodoDetail } from './TodoDetail';
import { ItemActionHandlers, ItemActions } from '../actions/ItemActions';
import { getItemKey } from '../utils/key';

type Props = {
  item: TodoItemType;
  key: string;
  parentSection: TodoSection;
  actionHandlers: ItemActionHandlers;
  additionalActions?: React.ReactNode;
};

export const TodoListItem = ({
  item,
  key,
  parentSection,
  actionHandlers,
  additionalActions,
}: Props) => {
  return (
    <List.Item
      key={key}
      id={key}
      icon={item.checked ? CHECKED_ICON : UNCHECKED_ICON}
      title={item.content}
      // TODO: read section using hook? will this recompute? check?
      detail={<TodoDetail item={item} parentSection={parentSection} />}
      actions={
        <ActionPanel>
          <ItemActions
            item={item}
            itemIndex={itemIndex}
            sectionIndex={sectionIndex}
            actionHandlers={actionHandlers}
          />
          {additionalActions}
        </ActionPanel>
      }
    />
  );
};
