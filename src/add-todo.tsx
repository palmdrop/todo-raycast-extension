import {
  Action,
  ActionPanel,
  Form,
  launchCommand,
  LaunchType,
  showToast,
  Toast,
} from '@raycast/api';
import { useEffect, useState } from 'react';
import fs from 'fs';
import { FormValidation, useForm } from '@raycast/utils';
import { addExistingTodoList, createTodoList } from './core/data';

type Values = {
  name: string;
  files: string[];
};

// TODO: replace spaces with hyphens
const getFileNameFromTodoName = (name: string) => {
  if (!name) return 'todos.md';
  return `${name.replaceAll(' ', '-').toLowerCase()}.md`;
};

export default function Command() {
  const [directorySelected, setDirectorySelected] = useState(false);

  const { handleSubmit, itemProps, values /*, setValidationError */ } =
    useForm<Values>({
      onSubmit: async (values) => {
        const { name, files } = values;
        try {
          // TODO: convert to using the useTodo hook... only modify state using this hook
          // NOTE: or should useTodo only handle a single todo? let other functions manage creating, listing, etc
          if (directorySelected) {
            const fileName = getFileNameFromTodoName(name);
            await createTodoList(files[0], fileName, name);
            showToast(Toast.Style.Success, 'Created todo list: ' + name);
          } else {
            await addExistingTodoList(files[0], name);
            showToast(
              Toast.Style.Success,
              `Added existing todo list ${files[0]} as ${name}`
            );
          }

          // push(<ListTodos />);
          launchCommand({ name: 'list-todos', type: LaunchType.UserInitiated });
        } catch (error) {
          showToast(Toast.Style.Failure, (error as Error).message);
          // TODO: setValidationError to name/files
        }
      },
      initialValues: {
        name: '',
        files: [],
      },
      validation: {
        // TODO: form validation that checks if the todo already exists!
        // name: FormValidation.Required,
        name: FormValidation.Required,
        files: FormValidation.Required,
      },
    });

  useEffect(() => {
    const file = values.files[0];
    if (!file) {
      setDirectorySelected(false);
      return;
    }

    const stats = fs.statSync(file);

    // If a directory is picked, a new file will be created automatically
    if (stats.isDirectory()) {
      setDirectorySelected(stats.isDirectory());
    }

    // TODO: set default name automatically if no name is set
  }, [values]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Name" placeholder="Name" {...itemProps.name} />
      <Form.FilePicker
        title="Pick file or directory"
        allowMultipleSelection={false} // TODO: allow multi-selection?
        canChooseDirectories={true}
        canChooseFiles={true}
        {...itemProps.files}
      />
      <Form.Description title="Selected file" text={values.files.join(', ')} />
      {directorySelected && (
        <Form.Description
          title="Will create new todo file"
          text={getFileNameFromTodoName(values.name)}
        />
      )}
    </Form>
  );
}
