import { Action, ActionPanel, Form } from '@raycast/api';
import { FormValidation, useForm } from '@raycast/utils';
import { TodoItem } from '../core/types';
import { useState } from 'react';

type FormValues = Omit<TodoItem, 'checked'>;

type Props = {
  initialTodoItem?: TodoItem;
  availableTags?: string[];
  onSubmit: (todoItem: TodoItem) => void;
};

export const EditTodoView = ({
  initialTodoItem,
  availableTags,
  onSubmit,
}: Props) => {
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState(availableTags ?? []);

  const { handleSubmit, itemProps, values } = useForm<FormValues>({
    onSubmit: async (values) => {
      const item = {
        checked: false,
        ...initialTodoItem,
        ...values,
      };

      onSubmit(item);
    },
    initialValues: initialTodoItem,
    validation: {
      content: FormValidation.Required,
    },
  });

  const addNewTag = () => {
    const addTagToList = (tag: string, tagList: string[]) => {
      if (tagList.includes(tag)) return tagList;
      return [...tagList, tag];
    };

    setAllTags((prev) => {
      const addedTags = addTagToList(newTag, values.tags ?? []);
      itemProps.tags.onChange?.(addedTags);
      setNewTag('');

      const tags = addTagToList(newTag, prev);
      return tags;
    });
  };

  return (
    <Form
      actions={
        <ActionPanel>
          {!newTag && (
            <Action.SubmitForm title="Save" onSubmit={handleSubmit} />
          )}
          <Action
            title="Add Tag"
            onAction={addNewTag}
            shortcut={{ modifiers: ['cmd'], key: 't' }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField title="Todo" {...itemProps.content} />
      <Form.TextArea title="Description" {...itemProps.description} />
      <Form.Separator />
      <Form.DatePicker title="Due" {...itemProps.due} />
      <Form.DatePicker title="Created" {...itemProps.created} />
      <Form.Separator />
      <Form.TagPicker title="Tags" {...itemProps.tags}>
        {allTags?.map((tag) => (
          <Form.TagPicker.Item key={tag} title={tag} value={tag} />
        ))}
      </Form.TagPicker>
      <Form.TextField
        id="new-tag"
        title="New Tag"
        placeholder="Type a new tag value."
        info="Press CMD+T to commit the new tag."
        value={newTag}
        onChange={setNewTag}
      />
    </Form>
  );
};
