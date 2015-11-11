import { applyMiddleware, combineReducers, compose, createStore as createReduxStore } from 'redux'
import thunk from 'redux-thunk'
import { reduxReactRouter as reduxReactClientRouter, routerStateReducer } from 'redux-router'
import { reduxReactRouter as reduxReactServerRouter } from 'redux-router/server'
import { createHistory, createMemoryHistory } from 'history'

import nucleateReducer from './reducer'

export default function createStore ({ browser, layouts, pages, routes }) {
  // Configure reducer to store state at state.router
  const reducer = combineReducers({
    router: routerStateReducer,
    nucleate: nucleateReducer
  })

  // Compose reduxReactRouter with other store enhancers
  const finalCreateStore = compose(
    applyMiddleware(thunk),
    (browser ? reduxReactClientRouter : reduxReactServerRouter)({
      createHistory: browser ? createHistory : createMemoryHistory,
      routes
    })
  )(createReduxStore)

  return finalCreateStore(reducer, {
    nucleate: { layouts, pages }
  })
}
