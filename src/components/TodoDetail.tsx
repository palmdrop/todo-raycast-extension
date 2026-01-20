import { List } from '@raycast/api';
import { TodoItem, TodoSection } from '../core/types';
import { useMemo } from 'react';
import {
  getCurrentStatusIcon,
  getStatusLabel,
  getStatusMarkdownSymbol,
} from '../utils/indicators';

type Props = {
  item: TodoItem;
  parentSection?: TodoSection;
};

const renderDescription = (description: string) => {
  // Renders a single line break as an actual markdown line break
  return description.split('\n').join('\n\n');
};

const getMarkdown = (item: TodoItem) => `
**${getStatusMarkdownSymbol(item.status)} ${item.content}**

${item.description ? renderDescription(item.description) : '[no description]'}
`;

export const TodoDetail = ({ item, parentSection }: Props) => {
  const markdown = useMemo(() => getMarkdown(item), [item]);

  return (
    <List.Item.Detail
      markdown={markdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label
            title="Status"
            text={getStatusLabel(item.status)}
            icon={getCurrentStatusIcon(item.status)}
          />
          {parentSection && (
            <List.Item.Detail.Metadata.Label
              title="Section"
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
          {item.created && (
            <List.Item.Detail.Metadata.Label
              title="Created"
              text={item.created?.toLocaleString()}
            />
          )}
          {!!item.tags?.length && (
            <List.Item.Detail.Metadata.TagList title="Tags">
              {item.tags.map((tag) => (
                <List.Item.Detail.Metadata.TagList.Item key={tag} text={tag} />
              ))}
            </List.Item.Detail.Metadata.TagList>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
};
