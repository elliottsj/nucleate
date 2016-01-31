## Option 1

1. bundle w/ webpack, using route-loader.js to mark modules which should be routes
2. server evals the bundle and resolves all async routes
4a. when serving, use `renderPath(routes, path)`
4b. when building, use `renderAll(routes)`
5. components will receive `context.site.routes`
