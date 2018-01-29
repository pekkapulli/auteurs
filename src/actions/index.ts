import { Dispatch } from 'redux';
import { Directors } from '../types';
import { StoreDirectorDataAction } from './types';

export function storeDirectorData(data: Directors): StoreDirectorDataAction {
  return {
    type: 'STORE_DIRECTOR_DATA',
    payload: data,
  };
}

// export function setGender(gender: Gender): SetGenderAction {
//   return {
//     type: 'SET_GENDER',
//     payload: gender,
//   };
// }

export function loadDirectorData() {
  return async (dispatch: Dispatch<any>) => {
    try {
      const response = await fetch(
        require('file-loader!../../data/directors.json'),
        { credentials: 'same-origin' },
      );
      const directorData: Directors = await response.json();
      dispatch(storeDirectorData(directorData));
    } catch (e) {
      // TODO: handle this better
      console.error('Unable to fetch director data', e);
    }
  };
}

export * from './types';
