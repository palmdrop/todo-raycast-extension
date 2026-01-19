import { UUID } from 'crypto';

export type Branded<T, Brand extends string> = T & { __brand: Brand };

export type ItemUUID = Branded<UUID, 'todo'>;
export type SectionUUID = Branded<UUID, 'section'>;

export type TodoItem = {
  id: ItemUUID;
  checked: boolean;
  content: string;
  description?: string;
  due: Date | null;
  created: Date | null;
  tags: string[];

  //created?: Date // TODO: default creation date is set to the last time file is edited
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
