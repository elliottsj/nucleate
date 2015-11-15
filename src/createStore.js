import { applyMiddleware, combineReducers, compose, createStore as createReduxStore } from 'redux'
import thunk from 'redux-thunk'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router'

import objectify from './util/objectify'
import nucleateReducer from './reducer'

export default function createStore ({ history, layouts, pages }) {
  // Configure reducer to store state at state.router
  const reducer = combineReducers({
    routing: routeReducer,
    nucleate: nucleateReducer
  })

  // Compose reduxReactRouter with other store enhancers
  const finalCreateStore = compose(
    applyMiddleware(thunk)
  )(createReduxStore)

  const store = finalCreateStore(reducer, {
    // Seed with initial data
    nucleate: {
      layouts: objectify(layouts),
      pages: objectify(pages)
    }
  })

  syncReduxAndRouter(history, store)

  return store
}
