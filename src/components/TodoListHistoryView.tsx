import { Action, ActionPanel, List } from '@raycast/api';
import { getHistory } from '../core';
import { useCachedPromise } from '@raycast/utils';

type Props = {
  name: string;
};

export const TodoListHistoryView = ({ name }: Props) => {
  const history = useCachedPromise(getHistory, [name]);

  return (
    <List isShowingDetail={true}>
      {history?.data?.undoStack?.map((entry) => (
        <List.Item
          key={entry.dateTime}
          title={entry.dateTime}
          detail={<List.Item.Detail markdown={entry.content} />}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action title="Restore" onAction={async () => {}} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};
