import { match } from 'react-router'
import { UPDATE_PATH } from 'redux-simple-router'

const last = arr => arr.slice(-1)[0]

export default function routeMatchMiddleware (routes) {
  return ({ dispatch, getState }) => next => action => {
    if (action.type === UPDATE_PATH) {
      match({ routes, location: action.path }, (error, redirectLocation, renderProps) => {
        const component = last(renderProps.components)
        dispatch({
          type: 'UPDATE_PAGE',
          payload: component
        })
      })
    }
    next(action)
  }
}
