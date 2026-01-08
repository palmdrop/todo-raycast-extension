import { List } from '@raycast/api';
import { TodoItem, TodoSection } from '../core/types';
import {
  CHECKED_LABEL,
  CHECKED_ICON,
  UNCHECKED_LABEL,
  UNCHECKED_ICON,
} from '../constants';

type Props = {
  item: TodoItem;
  parentSection?: TodoSection;
};

export const TodoDetail = ({ item, parentSection }: Props) => {
  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Todo" text={item.content} />
          <List.Item.Detail.Metadata.Label
            title="Status"
            text={item.checked ? CHECKED_LABEL : UNCHECKED_LABEL}
            icon={item.checked ? CHECKED_ICON : UNCHECKED_ICON}
          />
          <List.Item.Detail.Metadata.Label
            title="Description"
            text={item.description}
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
