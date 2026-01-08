import { ActionPanel, List } from '@raycast/api';
import { TodoItem as TodoItemType, TodoSection } from '../core/types';
import { CHECKED_ICON, UNCHECKED_ICON } from '../constants';
import { TodoDetail } from './TodoDetail';
import { ItemActionHandlers, ItemActions } from '../actions/ItemActions';
import { getItemKey } from '../utils/key';

type Props = {
  item: TodoItemType;
  parentSection: TodoSection;
  itemIndex: number;
  sectionIndex: number;
  actionHandlers: ItemActionHandlers;
  additionalActions?: React.ReactNode;
};

export const TodoListItem = ({
  item,
  parentSection,
  itemIndex,
  sectionIndex,
  actionHandlers,
  additionalActions,
}: Props) => {
  return (
    <List.Item
      key={getItemKey(itemIndex, sectionIndex)} // TODO: better key?
      id={getItemKey(itemIndex, sectionIndex)}
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
