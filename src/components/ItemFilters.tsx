import { List } from '@raycast/api';
import { FILTERS_BY_GROUP, NO_GROUP_KEY, TodoFilter } from '../core/filters';
import { useMemo } from 'react';

type Props = {
  defaultFilter: TodoFilter;
  filterChanged: (filter: TodoFilter) => void;
};

export const ItemFilters = ({ defaultFilter, filterChanged }: Props) => {
  const dropdownItems = useMemo(
    () =>
      Object.entries(FILTERS_BY_GROUP)
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
    []
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
