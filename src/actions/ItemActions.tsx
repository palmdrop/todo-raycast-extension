import { Action, ActionPanel, Icon, Keyboard } from '@raycast/api';
import { TodoItem } from '../core/types';
import { CHECK_ACTION_LABEL, UNCHECK_ACTION_LABEL } from '../constants';

export type ItemActionHandlers = {
  toggleItem: (itemIndex: number, sectionIndex: number) => void;
  onUpdate: (itemIndex: number, sectionIndex: number) => void;
  removeItem: (itemIndex: number, sectionIndex: number) => void;
  onMove: (
    itemIndex: number,
    sectionIndex: number,
    direction: 'up' | 'down'
  ) => void;
};

type Props = {
  item: TodoItem;
  itemIndex: number;
  sectionIndex: number;
  actionHandlers: ItemActionHandlers;
};

export const ItemActions = ({
  item,
  itemIndex,
  sectionIndex,
  actionHandlers,
}: Props) => {
  return (
    <ActionPanel.Section title="Item actions">
      <Action
        title={item.checked ? CHECK_ACTION_LABEL : UNCHECK_ACTION_LABEL}
        onAction={() => actionHandlers.toggleItem(itemIndex, sectionIndex)}
        icon={!item.checked ? Icon.Check : Icon.Xmark}
      />
      <Action
        title="Edit Item"
        onAction={() => actionHandlers.onUpdate(itemIndex, sectionIndex)}
        icon={Icon.Pencil}
        shortcut={Keyboard.Shortcut.Common.Edit}
      />
      <Action
        title="Delete Item"
        onAction={() => actionHandlers.removeItem(itemIndex, sectionIndex)}
        icon={Icon.Trash}
        shortcut={Keyboard.Shortcut.Common.Remove}
      />
      <Action
        title="Move Up"
        onAction={() => actionHandlers.onMove(itemIndex, sectionIndex, 'up')}
        icon={Icon.ArrowUp}
        shortcut={Keyboard.Shortcut.Common.MoveUp}
      />
      <Action
        title="Move Down"
        onAction={() => actionHandlers.onMove(itemIndex, sectionIndex, 'down')}
        icon={Icon.ArrowDown}
        shortcut={Keyboard.Shortcut.Common.MoveDown}
      />
    </ActionPanel.Section>
  );
};
