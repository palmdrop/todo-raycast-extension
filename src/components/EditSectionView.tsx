import { Action, ActionPanel, Form } from '@raycast/api';
import { FormValidation, useForm } from '@raycast/utils';
import { TodoSection } from '../core/types';

type FormValues = Omit<TodoSection, 'items'>;

type Props = {
  initialSection?: TodoSection;
  onSubmit: (section: TodoSection) => void;
};

export const EditSectionView = ({ initialSection, onSubmit }: Props) => {
  const { handleSubmit, itemProps, values } = useForm<FormValues>({
    onSubmit: async (values) => {
      const section = {
        items: [],
        ...initialSection,
        ...values,
      };

      onSubmit(section);
    },
    initialValues: initialSection,
    validation: {
      name: FormValidation.Required,
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
      <Form.Description title="Section" text={values.name ?? '[Unnamed]'} />
      <Form.Description
        title="Item count"
        text={initialSection?.items.length.toString() ?? '0'}
      />
      <Form.TextField title="Name" {...itemProps.name} />
    </Form>
  );
};
