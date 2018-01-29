import { Middleware } from 'redux';

import { SelectionsTree, StateTree } from './reducers';
import { isXAxisType } from './types';

function stateToHash(state: StateTree) {
  const { selections: { xAxisType } } = state;
  return `${xAxisType}`;
}

export function getURLHashContents(): Partial<SelectionsTree> {
  const xAxisType = window.location.hash.substring(1); // Remove leading '#'

  if (isXAxisType(xAxisType)) {
    return {
      xAxisType,
    };
  }

  return {};
}

export const middleware: Middleware = ({ getState }) => next => (
  action: any,
) => {
  const result = next(action);

  const stateHash = stateToHash(getState() as any);
  const currentHash = window.location.hash.substring(1); // Remove leading '#'

  if (stateHash !== currentHash) {
    window.location.hash = stateHash;
  }

  return result;
};
