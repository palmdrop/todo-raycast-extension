export type TodoItem = {
  checked: boolean;
  content: string;
  description?: string;
  // TODO: add dependencies
  // TODO: add subtasks
};

export type TodoList = {
  name: string;
  filePath: string;
  items: TodoItem[];
};
