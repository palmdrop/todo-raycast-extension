import { List } from '@raycast/api';
import {
  Filters,
  getFiltersByGroup,
  NO_GROUP_KEY,
  TodoFilter,
} from '../core/filters';
import { useMemo } from 'react';

type Props = {
  defaultFilter: TodoFilter;
  filters: Filters;
  filterChanged: (filter: TodoFilter) => void;
};

export const ItemFilters = ({
  defaultFilter,
  filters,
  filterChanged,
}: Props) => {
  const dropdownItems = useMemo(
    () =>
      Object.entries(getFiltersByGroup(filters))
        .map(([group, filters]) => {
          const items = filters.map((filter) => (
            <List.Dropdown.Item
              key={filter.key}
              title={filter.label}
              value={filter.key}
            />
          ));

          if (group === NO_GROUP_KEY) {
            return items;
          }

          return (
            <List.Dropdown.Section key={group} title={group}>
              {items}
            </List.Dropdown.Section>
          );
        })
        .flat()
        .filter(Boolean),
    [filters]
  );

  return (
    <List.Dropdown
      storeValue={true}
      tooltip="Filter"
      defaultValue={defaultFilter}
      onChange={(value) => filterChanged(value as TodoFilter)}
    >
      {dropdownItems}
    </List.Dropdown>
  );
};
