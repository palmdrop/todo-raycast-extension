import { LocalStorage } from '@raycast/api';

const HISTORY_KEY_PREFIX = 'HISTORY_';

// TODO: figure out if this needs optimizing. Store content and list of history entries separately?
export type HistoryEntry = {
  dateTime: string;
  focusedItem: number | null;
  content: string;
};

type History = {
  undoStack: HistoryEntry[];
  current: HistoryEntry | null;
  redoStack: HistoryEntry[];
};

// TODO: make this configurable using preferences
const HISTORY_LENGTH = 30;

const getKey = (name: string) =>
  `${HISTORY_KEY_PREFIX}_${name.replaceAll(' ', '_')}`;

export const get = async (name: string): Promise<History> => {
  const storedData = await LocalStorage.getItem<string>(getKey(name));
  return storedData
    ? (JSON.parse(storedData) as History)
    : { undoStack: [], current: null, redoStack: [] };
};

const set = async (name: string, history: History) => {
  await LocalStorage.setItem(getKey(name), JSON.stringify(history));
};

export const push = async (name: string, entry: HistoryEntry) => {
  const history = await get(name);

  const newHistory: History = {
    undoStack: [history.current, ...history.undoStack]
      .filter(Boolean)
      .slice(0, HISTORY_LENGTH) as HistoryEntry[],
    current: entry,
    redoStack: [],
  };

  await set(name, newHistory);
};

export const pop = async (name: string, index = 0) => {
  const history = await get(name);

  if (!history.undoStack.length) return null;

  const entry = history.undoStack[index];
  const newHistory: History = {
    undoStack: history.undoStack.slice(index + 1),
    current: entry,
    redoStack: [history.current, ...history.redoStack]
      .filter(Boolean)
      .slice(0, HISTORY_LENGTH) as HistoryEntry[],
  };

  await set(name, newHistory);

  return entry;
};

export const popFromRedo = async (name: string, index = 0) => {
  const history = await get(name);

  if (!history.redoStack.length) {
    return null;
  }

  const entry = history.redoStack[index];
  const newHistory = {
    undoStack: [history.current, ...history.undoStack]
      .filter(Boolean)
      .slice(0, HISTORY_LENGTH) as HistoryEntry[],
    current: entry,
    redoStack: history.redoStack.slice(index + 1),
  };

  await set(name, newHistory);

  return entry;
};

export const init = async (name: string, currentContent: string) => {
  const currentHistory = await get(name);
  const current = currentHistory.current;

  if (current && current.content === currentContent) {
    return;
  }

  await push(name, {
    dateTime: new Date().toISOString(),
    focusedItem: null,
    content: currentContent,
  });
};

export const clear = async (name: string) => {
  await LocalStorage.removeItem(getKey(name));
};

export const canUndoRedo = async (name: string) => {
  const history = await get(name);
  return {
    hasUndo: history.undoStack.length > 0,
    hasRedo: history.redoStack.length > 0,
  };
};
