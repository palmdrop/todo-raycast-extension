import { LocalStorage } from '@raycast/api';

const HISTORY_KEY_PREFIX = 'TODO_HISTORY';

// TODO: figure out if this needs optimizing. Store content and list of history entries separately?
type HistoryEntry = {
  dateTime: string;
  content: string;
};

// TODO: make this configurable using preferences
const HISTORY_LENGTH = 30;

const getHistoryKey = (name: string) =>
  `${HISTORY_KEY_PREFIX}_${name.replaceAll(' ', '_')}`;

export const getHistory = async (name: string) => {
  const storedData = await LocalStorage.getItem<string>(getHistoryKey(name));
  return storedData ? (JSON.parse(storedData) as HistoryEntry[]) : [];
};

const setHistory = async (name: string, history: HistoryEntry[]) => {
  await LocalStorage.setItem(getHistoryKey(name), JSON.stringify(history));
};

export const pushHistory = async (name: string, entry: HistoryEntry) => {
  const history = await getHistory(name);
  const newHistory = [entry, ...history].slice(0, HISTORY_LENGTH);
  await setHistory(name, newHistory);
};

// TODO: need a redo stack as well
export const popHistory = async (name: string, index = 0) => {
  const history = await getHistory(name);

  const entry = history[index + 1];
  const newHistory = history.slice(index + 1);

  await setHistory(name, newHistory);

  return entry;
};

export const clearHistory = async (name: string) => {
  await LocalStorage.removeItem(getHistoryKey(name));
};
