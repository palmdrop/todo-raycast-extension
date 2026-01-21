import { Color, Icon } from '@raycast/api';

export const CHECKED_ICON = {
  source: Icon.CircleFilled,
  tintColor: Color.Green,
};

export const UNCHECKED_ICON = {
  source: Icon.Circle,
  tintColor: Color.Red,
};

export const UNCHECK_ICON = {
  source: Icon.Xmark,
};

export const CHECK_ICON = {
  source: Icon.Check,
};

export const INVALID_ICON = {
  source: Icon.StrikeThrough,
  tintColor: Color.SecondaryText,
};

export const CHECKED_LABEL = 'Completed';
export const INVALID_LABEL = 'Invalid';
export const UNCHECKED_LABEL = 'Not Completed';

export const CHECK_ACTION_LABEL = 'Check';
export const INVALIDATE_ACTION_LABEL = 'Invalidate';
export const REVALIDATE_ACTION_LABEL = 'Revalidate';
export const UNCHECK_ACTION_LABEL = 'Uncheck';
