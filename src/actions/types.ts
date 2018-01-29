import { Directors, XAxisType } from '../types';

export interface StoreDirectorDataAction {
  type: 'STORE_DIRECTOR_DATA';
  payload: Directors;
}

export interface SetXAxisType {
  type: 'SET_X_AXIS_TYPE';
  payload: XAxisType;
}

export type Action = StoreDirectorDataAction | SetXAxisType;
