export type TodoItem = {
  checked: boolean;
  content: string;
  description?: string;
  due: Date | null;
  //created?: Date
  // TODO: add dependencies
  // TODO: add subtasks
};

export type TodoSection = {
  name?: string;
  items: TodoItem[];
};

export type TodoList = {
  name: string;
  sections: TodoSection[];
};
