import { applyMiddleware, combineReducers, compose, createStore as createReduxStore } from 'redux'
// import { devTools } from 'redux-devtools'
import thunk from 'redux-thunk'
import { reduxReactRouter, routerStateReducer } from 'redux-router'
import { createHistory, createMemoryHistory } from 'history'

export default function createStore ({ browser }) {
  // Configure reducer to store state at state.router
  const reducer = combineReducers({
    router: routerStateReducer
  })

  // Compose reduxReactRouter with other store enhancers
  const finalCreateStore = compose(
    applyMiddleware(thunk),
    reduxReactRouter({
      createHistory: browser ? createHistory : createMemoryHistory
    }),
    // devTools()
  )(createReduxStore)

  return finalCreateStore(reducer)
}
