const express = require('express')
const bodyParser = require('body-parser')
import { AppRoutes } from './routes'
import { retrieveAnnotation } from './routes/annotation';

export default function createApp(
  {routes, allowUndefinedRoutes = false} :
  {routes : AppRoutes, allowUndefinedRoutes? : boolean}
) {
  function route(f?) {
    if (!f && allowUndefinedRoutes) {
      f = () => {}
    }
    return f
  }

  const app = express()
  app.use(bodyParser.json())
  app.get('/__/*', (req, res) => {
    // TODO: Hack because no idea how to catch a wildcard in a param
    req.params.url = req.path.substr('/__/'.length)
    route(routes.proxy)(req, res)
  })
  app.get('/:id/*', (req, res) => {
    // TODO: Hack because no idea how to catch a wildcard in a param
    req.params.url = req.path.substr(req.params.id.length + '//'.length)
    route(routes.retrieveAnnotation)(req, res)
  })
  app.post('/', route(routes.putAnnotation))
  return app
}
