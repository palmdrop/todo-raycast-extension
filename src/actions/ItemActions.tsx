import { Action, ActionPanel, Icon, Keyboard } from '@raycast/api';
import { TodoItem } from '../core/types';
import { CHECK_ACTION_LABEL, UNCHECK_ACTION_LABEL } from '../constants';

export type ItemActionHandlers = {
  toggleItem: () => void;
  onUpdate: () => void;
  removeItem: () => void;
  onMove?: (direction: 'up' | 'down') => void;
};

type Props = {
  item: TodoItem;
  actionHandlers: ItemActionHandlers;
};

export const ItemActions = ({ item, actionHandlers }: Props) => {
  return (
    <ActionPanel.Section title="Item actions">
      <Action
        title={item.checked ? CHECK_ACTION_LABEL : UNCHECK_ACTION_LABEL}
        onAction={() => actionHandlers.toggleItem()}
        icon={!item.checked ? Icon.Check : Icon.Xmark}
      />
      <Action
        title="Edit Item"
        onAction={() => actionHandlers.onUpdate()}
        icon={Icon.Pencil}
        shortcut={Keyboard.Shortcut.Common.Edit}
      />
      <Action
        title="Delete Item"
        onAction={() => actionHandlers.removeItem()}
        icon={Icon.Trash}
        shortcut={Keyboard.Shortcut.Common.Remove}
      />
      {!!actionHandlers.onMove && (
        <>
          <Action
            title="Move Up"
            onAction={() => actionHandlers.onMove!('up')}
            icon={Icon.ArrowUp}
            shortcut={Keyboard.Shortcut.Common.MoveUp}
          />
          <Action
            title="Move Down"
            onAction={() => actionHandlers.onMove!('down')}
            icon={Icon.ArrowDown}
            shortcut={Keyboard.Shortcut.Common.MoveDown}
          />
        </>
      )}
    </ActionPanel.Section>
  );
};
