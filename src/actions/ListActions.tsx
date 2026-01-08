import { Action, ActionPanel, Icon, Keyboard } from '@raycast/api';

export type TodoListActionHandlers = {
  onAdd: () => void;
  onEditSection: () => void;
  onAddSection: () => void;
  removeSection: (keepItems: boolean) => void;
  setShowDetail: (
    showingDetail: boolean | ((previousValue: boolean) => boolean)
  ) => void;
  revaluate: () => void;
};

type Props = {
  showDetail: boolean;
  actionHandlers: TodoListActionHandlers;
};

export const ListActions = ({ showDetail, actionHandlers }: Props) => {
  return (
    <ActionPanel.Section title="List actions">
      <Action
        title="Add Item"
        onAction={actionHandlers.onAdd}
        icon={Icon.Plus}
        shortcut={Keyboard.Shortcut.Common.New}
      />
      <Action
        title="Add Item Before"
        onAction={actionHandlers.onAdd}
        icon={Icon.Plus}
      />
      <Action
        title="Add Item After"
        onAction={actionHandlers.onAdd}
        icon={Icon.Plus}
      />
      <Action
        title="Edit Section"
        onAction={actionHandlers.onEditSection}
        icon={Icon.Pencil}
      />
      <Action
        title="Add Section"
        onAction={actionHandlers.onAddSection}
        icon={Icon.Pencil}
      />
      <Action
        title="Delete Section"
        onAction={() => actionHandlers.removeSection(true)}
        icon={Icon.Trash}
      />
      <Action
        title="Show Details"
        onAction={() =>
          actionHandlers.setShowDetail((showDetail) => !showDetail)
        }
        icon={showDetail ? Icon.EyeDisabled : Icon.Eye}
        shortcut={Keyboard.Shortcut.Common.Open}
      />
      <Action
        title="Refresh"
        onAction={actionHandlers.revaluate}
        icon={Icon.ArrowClockwise}
        shortcut={Keyboard.Shortcut.Common.Refresh}
      />
    </ActionPanel.Section>
  );
};
