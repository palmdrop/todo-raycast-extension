export type TodoItem = {
  checked: boolean;
  content: string;
  description?: string;
  due: Date | null;
  //created?: Date
  // TODO: add dependencies
  // TODO: add subtasks
};

export type TodoList = {
  name: string;
  sections: {
    name?: string;
    items: TodoItem[];
  }[];
};
