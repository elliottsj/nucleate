const DEFAULT_STATE = {
  currentPage: null,
  layouts: {},
  pages: {}
}

export default function nucleate (state = DEFAULT_STATE, action) {
  switch (action.type) {
    case 'UPDATE_ROUTE':
      debugger
      return {
        ...state,
        currentPage: action.payload
      }
    default:
      return state
  }
}
