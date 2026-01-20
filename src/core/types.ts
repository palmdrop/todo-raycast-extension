import { UUID } from 'crypto';

export type Branded<T, Brand extends string> = T & { __brand: Brand };

export type ItemUUID = Branded<UUID, 'todo'>;
export type SectionUUID = Branded<UUID, 'section'>;

export type ItemStatus = 'checked' | 'unchecked' | 'invalid';

export type TodoItem = {
  id: ItemUUID;
  // checked: boolean;
  status: ItemStatus;
  content: string;
  description?: string;
  due: Date | null;
  created: Date | null;
  tags: string[];

  // TODO: add dependencies
  // TODO: add subtasks
};

export type TodoSection = {
  id: SectionUUID;
  name?: string;
  items: TodoItem[];
};

export type TodoList = {
  name: string;
  sections: TodoSection[];
};
