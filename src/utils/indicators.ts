import {
  CHECK_ACTION_LABEL,
  CHECK_ICON,
  CHECKED_ICON,
  CHECKED_LABEL,
  INVALID_ICON,
  INVALID_LABEL,
  INVALIDATE_ACTION_LABEL,
  REVALIDATE_ACTION_LABEL,
  UNCHECK_ACTION_LABEL,
  UNCHECK_ICON,
  UNCHECKED_ICON,
  UNCHECKED_LABEL,
} from '../constants';
import { ItemStatus } from '../core/types';

export const getCurrentStatusIcon = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
      return CHECKED_ICON;
    case 'unchecked':
      return UNCHECKED_ICON;
    case 'invalid':
      return INVALID_ICON;
    default:
      return undefined;
  }
};

export const getStatusActionIcon = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
    case 'invalid':
      return UNCHECK_ICON;
    case 'unchecked':
      return CHECK_ICON;
    default:
      return undefined;
  }
};

export const getStatusLabel = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
      return CHECKED_LABEL;
    case 'unchecked':
      return UNCHECKED_LABEL;
    case 'invalid':
      return INVALID_LABEL;
  }
};

export const getStatusActionLabel = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
    case 'invalid':
      return UNCHECK_ACTION_LABEL;
    case 'unchecked':
    default:
      return CHECK_ACTION_LABEL;
  }
};

export const getInvalidateActionLabel = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
    case 'unchecked':
      return INVALIDATE_ACTION_LABEL;
    default:
      return REVALIDATE_ACTION_LABEL;
  }
};

export const getInvalidateActionIcon = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
    case 'unchecked':
      return INVALID_ICON;
    default:
      return UNCHECKED_ICON;
  }
};

export const getStatusMarkdownSymbol = (status: ItemStatus) => {
  switch (status) {
    case 'checked':
      return '✅';
    case 'invalid':
      return 'I'; // TODO
    case 'unchecked':
    default:
      return '❌';
  }
};
