import { Action, ActionPanel, Icon, Keyboard } from '@raycast/api';

export type TodoListActionHandlers = {
  onAdd?: (mode: 'before' | 'after') => void;
  onEditSection: () => void;
  onAddSection?: () => void;
  removeSection?: (keepItems: boolean) => void;
  setShowDetail: (
    showingDetail: boolean | ((previousValue: boolean) => boolean)
  ) => void;
  undo?: () => void;
  redo?: () => void;
  clearHistory: () => void;
  revaluate: () => void;
};

type Props = {
  showDetail: boolean;
  actionHandlers: TodoListActionHandlers;
};

export const ListActions = ({ showDetail, actionHandlers }: Props) => {
  return (
    <>
      <ActionPanel.Section title="New">
        {actionHandlers.onAdd && (
          <Action
            title="Add Item"
            onAction={() => actionHandlers.onAdd!('after')}
            icon={Icon.Plus}
            shortcut={Keyboard.Shortcut.Common.New}
          />
        )}
        <Action
          title="Add Item Before"
          onAction={() => actionHandlers.onAdd!('before')}
          icon={Icon.Plus}
        />
        <Action
          title="Add Item After"
          onAction={() => actionHandlers.onAdd!('after')}
          icon={Icon.Plus}
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="Section">
        <Action
          title="Edit Section"
          onAction={actionHandlers.onEditSection}
          icon={Icon.Pencil}
        />
        {actionHandlers.onAddSection && (
          <Action
            title="Add Section"
            onAction={actionHandlers.onAddSection}
            icon={Icon.Pencil}
          />
        )}
        {actionHandlers.removeSection && (
          <Action
            title="Delete Section"
            onAction={() => actionHandlers.removeSection!(true)}
            icon={Icon.Trash}
            style={Action.Style.Destructive}
          />
        )}
      </ActionPanel.Section>
      <ActionPanel.Section title="Details">
        <Action
          title="Show Details"
          onAction={() =>
            actionHandlers.setShowDetail((showDetail) => !showDetail)
          }
          icon={showDetail ? Icon.EyeDisabled : Icon.Eye}
          shortcut={Keyboard.Shortcut.Common.Open}
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="History">
        {actionHandlers.undo && (
          <Action
            title="Undo"
            onAction={actionHandlers.undo}
            icon={Icon.Undo}
            shortcut={{ modifiers: ['cmd'], key: 'z' }}
          />
        )}
        {actionHandlers.redo && (
          <Action
            title="Redo"
            onAction={actionHandlers.redo}
            icon={Icon.Redo}
            shortcut={{ modifiers: ['cmd', 'shift'], key: 'z' }}
          />
        )}
        <Action
          title="Clear History"
          onAction={actionHandlers.clearHistory}
          icon={Icon.Trash}
          style={Action.Style.Destructive}
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="Other">
        <Action
          title="Refresh"
          onAction={actionHandlers.revaluate}
          icon={Icon.ArrowClockwise}
          shortcut={Keyboard.Shortcut.Common.Refresh}
        />
      </ActionPanel.Section>
    </>
  );
};
