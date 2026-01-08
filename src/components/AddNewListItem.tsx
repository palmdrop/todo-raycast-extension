import { Action, ActionPanel, Icon, Keyboard, List } from '@raycast/api';
import { getItemKey } from '../utils/key';

type Props = {
  sectionIndex: number;
  actionHandlers: {
    onAdd: (sectionIndex: number) => void;
  };
  additionalActions: React.ReactNode;
};

export const AddNewListItem = ({
  sectionIndex,
  actionHandlers,
  additionalActions,
}: Props) => {
  return (
    <List.Item
      key={getItemKey(-1, sectionIndex)}
      id={getItemKey(-1, sectionIndex)}
      icon={Icon.Plus}
      title="Add item"
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Item actions">
            <Action
              title="Add Item"
              onAction={() => actionHandlers.onAdd(sectionIndex)}
              icon={Icon.Plus}
              shortcut={Keyboard.Shortcut.Common.New}
            />
          </ActionPanel.Section>
          {additionalActions}
        </ActionPanel>
      }
    />
  );
};
