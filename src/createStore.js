import { applyMiddleware, combineReducers, compose, createStore as createReduxStore } from 'redux'
// import { devTools } from 'redux-devtools'
import thunk from 'redux-thunk'
import { reduxReactRouter as reduxReactClientRouter, routerStateReducer } from 'redux-router'
import { reduxReactRouter as reduxReactServerRouter } from 'redux-router/server'
import { createHistory, createMemoryHistory } from 'history'

export default function createStore ({ browser, routes }) {
  // Configure reducer to store state at state.router
  const reducer = combineReducers({
    router: routerStateReducer
  })

  // Compose reduxReactRouter with other store enhancers
  const finalCreateStore = compose(
    applyMiddleware(thunk),
    (browser ? reduxReactClientRouter : reduxReactServerRouter)({
      createHistory: browser ? createHistory : createMemoryHistory,
      routes
    }),
    // devTools()
  )(createReduxStore)

  return finalCreateStore(reducer)
}
