import { Action, ActionPanel, Icon, Keyboard, List } from '@raycast/api';
import { SectionUUID } from '../core/types';

type Props = {
  sectionId: SectionUUID;
  actionHandlers: {
    onAdd: (sectionId: SectionUUID) => void;
  };
  additionalActions: React.ReactNode;
};

export const AddNewListItem = ({
  sectionId,
  actionHandlers,
  additionalActions,
}: Props) => {
  return (
    <List.Item
      key={`add-item-${sectionId}`}
      id={`add-item-${sectionId}`}
      icon={Icon.Plus}
      title="Add item"
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Item actions">
            <Action
              title="Add Item"
              onAction={() => actionHandlers.onAdd(sectionId)}
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
