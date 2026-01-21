import { Action, ActionPanel, Icon, Keyboard } from '@raycast/api';
import { TodoItem } from '../core/types';
import {
  getInvalidateActionIcon,
  getInvalidateActionLabel,
  getStatusActionIcon,
  getStatusActionLabel,
} from '../utils/indicators';

export type ItemActionHandlers = {
  toggleItem: () => void;
  toggleItemValid: () => void;
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
    <ActionPanel.Section title="Item">
      <Action
        title={getStatusActionLabel(item.status)}
        onAction={() => actionHandlers.toggleItem()}
        icon={getStatusActionIcon(item.status)?.source}
      />
      <Action
        title="Edit Item"
        onAction={() => actionHandlers.onUpdate()}
        icon={Icon.Pencil}
        shortcut={Keyboard.Shortcut.Common.Edit}
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
      <Action
        title={getInvalidateActionLabel(item.status)}
        onAction={() => actionHandlers.toggleItemValid()}
        icon={getInvalidateActionIcon(item.status)}
      />
      <Action
        title="Delete Item"
        onAction={() => actionHandlers.removeItem()}
        icon={Icon.Trash}
        shortcut={Keyboard.Shortcut.Common.Remove}
        style={Action.Style.Destructive}
      />
    </ActionPanel.Section>
  );
};
