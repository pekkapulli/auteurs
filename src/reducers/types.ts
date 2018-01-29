import { Directors, XAxisType } from '../types';

export interface StateTree {
  data: DataTree;
  selections: SelectionsTree;
}

export interface DataTree {
  directorData: Directors;
}

export interface SelectionsTree {
  xAxisType: XAxisType;
}
