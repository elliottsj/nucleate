import { applyMiddleware, combineReducers, compose } from 'redux'
import { createHistory, createMemoryHistory } from 'history'
import { reduxReactRouter as reduxReactClientRouter, routerStateReducer } from 'redux-router'
import { reduxReactRouter as reduxReactServerRouter } from 'redux-router/server'
import thunk from 'redux-thunk'

import objectify from './utils/objectify'
import nucleateReducer from './reducer'

export default function applyNucleate ({ browser, pages, layouts, routes }) {
  return next => (reducer, initialState) => {
    // Configure reducer to store state at state.router
    const finalReducer = combineReducers({
      router: routerStateReducer,
      nucleate: nucleateReducer
    })

    const finalCreateStore = compose(
      applyMiddleware(thunk),
      browser
        ? reduxReactClientRouter({ createHistory, routes })
        : reduxReactServerRouter({ createHistory: createMemoryHistory, routes })
    )(next)

    const store = finalCreateStore(finalReducer, {
      // Seed with initial data
      nucleate: {
        currentPage: '',
        layouts: objectify(layouts),
        pages: objectify(pages)
      }
    })

    return store
  }
}
