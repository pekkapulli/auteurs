import { combineReducers } from 'redux';

import { Action } from '../actions';
import { getURLHashContents } from '../state-to-hash-middleware';
import { DataTree, SelectionsTree, StateTree } from './types';

const hashContents = getURLHashContents();
export const initialState: StateTree = {
  data: {
    directorData: {},
  },
  selections: {
    xAxisType: 'year',
    ...hashContents,
  },
};

function dataReducer(state = initialState.data, action: Action): DataTree {
  switch (action.type) {
    case 'STORE_DIRECTOR_DATA':
      return {
        ...state,
        directorData: action.payload,
      };
  }
  return state;
}

function selectionsReducer(
  state = initialState.selections,
  action: Action,
): SelectionsTree {
  switch (action.type) {
    case 'SET_X_AXIS_TYPE':
      if (state.xAxisType !== action.payload) {
        return {
          ...state,
          xAxisType: action.payload,
        };
      }
      return state;
  }
  return state;
}

export default combineReducers<StateTree>({
  data: dataReducer,
  selections: selectionsReducer,
} as any);

export * from './types';
