import { List } from '@raycast/api';
import { TodoItem, TodoSection } from '../core/types';
import {
  CHECKED_LABEL,
  CHECKED_ICON,
  UNCHECKED_LABEL,
  UNCHECKED_ICON,
} from '../constants';
import { useMemo } from 'react';

type Props = {
  item: TodoItem;
  parentSection?: TodoSection;
};

export const TodoDetail = ({ item, parentSection }: Props) => {
  const markdown = useMemo(
    () => `
**${item.checked ? '✅' : '❌'} ${item.content}**

${item.description || '[no description]'}
`,
    [item]
  );

  return (
    <List.Item.Detail
      markdown={markdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label
            title="Status"
            text={item.checked ? CHECKED_LABEL : UNCHECKED_LABEL}
            icon={item.checked ? CHECKED_ICON : UNCHECKED_ICON}
          />
          {parentSection && (
            <List.Item.Detail.Metadata.Label
              title="In Section"
              text={parentSection.name}
            />
          )}
          <List.Item.Detail.Metadata.Separator />
          {item.due && (
            <List.Item.Detail.Metadata.Label
              title="Due Date"
              text={item.due?.toLocaleString()}
            />
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
};
