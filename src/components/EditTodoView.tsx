import { Action, ActionPanel, Form } from '@raycast/api';
import { FormValidation, useForm } from '@raycast/utils';
import { TodoItem } from '../core/types';

type FormValues = Omit<TodoItem, 'checked'>;

type Props = {
  initialTodoItem?: TodoItem;
  onSubmit: (todoItem: TodoItem) => void;
};

export const EditTodoView = ({ initialTodoItem, onSubmit }: Props) => {
  const { handleSubmit, itemProps } = useForm<FormValues>({
    onSubmit: async (values) => {
      const item = {
        checked: false,
        ...values,
      };

      onSubmit(item);
    },
    initialValues: initialTodoItem,
    validation: {
      content: FormValidation.Required,
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Todo" {...itemProps.content} />
      <Form.TextArea title="Description" {...itemProps.description} />
      <Form.DatePicker title="Due Date" {...itemProps.due} />
    </Form>
  );
};
