import { randomUUID } from 'crypto';
import { ItemUUID, SectionUUID, TodoItem, TodoSection } from './types';

export const createItem = (initialFields?: Partial<TodoItem>): TodoItem => {
  return {
    id: randomUUID() as ItemUUID,
    checked: false,
    content: '',
    description: '',
    due: null,
    created: new Date(),
    tags: [],
    ...(initialFields ?? {}),
  };
};

export const createSection = (
  initialFields?: Partial<TodoSection>
): TodoSection => {
  return {
    id: randomUUID() as SectionUUID,
    items: [],
    ...(initialFields ?? {}),
  };
};
