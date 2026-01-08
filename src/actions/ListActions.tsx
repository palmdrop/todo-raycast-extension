import { Action, ActionPanel, Icon, Keyboard } from '@raycast/api';

export type TodoListActionHandlers = {
  onAdd: (itemIndex: number, sectionIndex: number, before: boolean) => void;
  onEditSection: (sectionIndex: number) => void;
  onAddSection: (sectionIndex: number, itemIndex: number) => void;
  removeSection: (sectionIndex: number, confirm: boolean) => void;
  setShowDetail: (
    showingDetail: boolean | ((previousValue: boolean) => boolean)
  ) => void;
  revaluate: () => void;
};

type Props = {
  showDetail: boolean;
  itemIndex: number;
  sectionIndex: number;
  actionHandlers: TodoListActionHandlers;
};

export const ListActions = ({
  showDetail,
  itemIndex,
  sectionIndex,
  actionHandlers,
}: Props) => {
  return (
    <ActionPanel.Section title="List actions">
      <Action
        title="Add Item"
        onAction={() => actionHandlers.onAdd(itemIndex, sectionIndex, true)}
        icon={Icon.Plus}
        shortcut={Keyboard.Shortcut.Common.New}
      />
      <Action
        title="Add Item Before"
        onAction={() => actionHandlers.onAdd(itemIndex, sectionIndex, false)}
        icon={Icon.Plus}
      />
      <Action
        title="Add Item After"
        onAction={() => actionHandlers.onAdd(itemIndex, sectionIndex, true)}
        icon={Icon.Plus}
      />
      <Action
        title="Edit Section"
        onAction={() => actionHandlers.onEditSection(sectionIndex)}
        icon={Icon.Pencil}
      />
      <Action
        title="Add Section"
        onAction={() => actionHandlers.onAddSection(sectionIndex, itemIndex)}
        icon={Icon.Pencil}
      />
      <Action
        title="Delete Section"
        onAction={() => actionHandlers.removeSection(sectionIndex, true)}
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
