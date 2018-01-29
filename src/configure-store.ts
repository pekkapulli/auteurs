import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import rootReducer, { StateTree } from './reducers';
import { middleware as hashMiddleware } from './state-to-hash-middleware';

declare var window: { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any };
declare var module: { hot: any };

function configureStore(initialState: StateTree) {
  const composeEnhancers =
    (process.env.NODE_ENV !== 'production' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(hashMiddleware, thunkMiddleware)),
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = (require('./reducers') as any).default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

export default configureStore;
