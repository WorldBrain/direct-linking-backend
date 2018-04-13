const express = require('express')
const bodyParser = require('body-parser')
import { AppRoutes } from './routes'

export default function createApp(
  {routes, preConfigure, allowUndefinedRoutes = false} :
  {routes : AppRoutes, preConfigure? : Function, allowUndefinedRoutes? : boolean}
) {
  function route(f?) {
    if (!f && allowUndefinedRoutes) {
      f = () => {}
    }
    return f
  }

  const app = express()
  app.use(bodyParser.json())
  preConfigure && preConfigure(app)
  app.post('/', route(routes.putAnnotation))
  return app
}
