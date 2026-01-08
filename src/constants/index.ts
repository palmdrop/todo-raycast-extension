import { Color, Icon } from '@raycast/api';

export const CHECKED_ICON = {
  source: Icon.CircleFilled,
  tintColor: Color.Green,
};

export const UNCHECKED_ICON = {
  source: Icon.Circle,
  tintColor: Color.Red,
};

export const CHECKED_LABEL = 'Completed';
export const UNCHECKED_LABEL = 'Not Completed';

export const CHECK_ACTION_LABEL = 'Check';
export const UNCHECK_ACTION_LABEL = 'Uncheck';
