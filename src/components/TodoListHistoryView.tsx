import { Action, ActionPanel, confirmAlert, List } from '@raycast/api';
import moment from 'moment';
import { useMemo } from 'react';
import { getHistory, restoreTo } from '../core';
import { useCachedPromise } from '@raycast/utils';
import { HistoryEntry } from '../core/history';

type Props = {
  name: string;
  onRestore?: (entry: HistoryEntry) => void;
};

const getRelativeTime = (dateTime: string) => {
  return moment(dateTime).fromNow();
};

const getFormattedDate = (dateTime: string) => {
  return moment(dateTime).format('YYYY-MM-DD');
};

const getFormattedTime = (dateTime: string) => {
  return moment(dateTime).format('HH:mm');
};

const isSameDay = (dateTime1: string, dateTime2: string) => {
  return moment(dateTime1).isSame(dateTime2, 'day');
};

export const TodoListHistoryView = ({ name, onRestore }: Props) => {
  const history = useCachedPromise(getHistory, [name]);

  const restore = async (entry: HistoryEntry) => {
    if (
      !(await confirmAlert({
        title: `Are you sure you want to revert to ${entry.dateTime}?`,
        message: 'This action cannot be undone.',
      }))
    ) {
      return;
    }

    await restoreTo(name, entry);

    onRestore?.(entry);
  };

  const groups = useMemo(
    () =>
      history?.data?.undoStack?.reduce(
        (acc, entry) => {
          const relative = getRelativeTime(entry.dateTime);
          const date = getFormattedDate(entry.dateTime);
          if (!acc[relative]) {
            acc[relative] = { entries: [], date };
          }
          acc[relative].entries.push(entry);
          return acc;
        },
        {} as { [key: string]: { entries: HistoryEntry[]; date: string } }
      ),
    [history?.data?.undoStack]
  );

  const renderEntry = (
    entry: HistoryEntry,
    title: string,
    subtitle?: string
  ) => {
    return (
      <List.Item
        key={entry.dateTime}
        title={title}
        subtitle={subtitle}
        detail={<List.Item.Detail markdown={entry.content} />}
        actions={
          <ActionPanel>
            <ActionPanel.Section>
              <Action title="Restore" onAction={() => restore(entry)} />
            </ActionPanel.Section>
          </ActionPanel>
        }
      />
    );
  };

  return (
    <List isShowingDetail={true}>
      {Object.entries(groups ?? {}).map(([key, { entries, date }]) => {
        if (entries.length === 1) {
          return renderEntry(entries[0], key, date);
        }

        const showSubtitle = isSameDay(
          entries.at(0)!.dateTime,
          entries.at(-1)!.dateTime
        );

        return (
          <List.Section key={key} title={key} subtitle={date}>
            {entries.map((entry) => {
              const date = getFormattedDate(entry.dateTime);
              const time = getFormattedTime(entry.dateTime);

              return renderEntry(
                entry,
                showSubtitle ? time : date,
                showSubtitle ? undefined : time
              );
            })}
          </List.Section>
        );
      })}
    </List>
  );
};
