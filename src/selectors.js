const last = arr => arr.slice(-1)[0]

export function selectCurrentPage (state) {
  const deepestRoute = last(state.router.routes)
  return deepestRoute.component
}
