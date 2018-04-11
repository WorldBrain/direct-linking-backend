import * as request from 'supertest'
import createApp from './app'
import { expect } from 'chai';

describe('Express app', () => {
  let app
  let log = {
    called: false,
    req: null,
    res: null,
  }

  async function initApp(routes) {
    app = createApp({routes, allowUndefinedRoutes: true})
    // app.listen(3000,)
    return app
  }

  // afterEach(async () => {
  //   await new Promise((resolve, reject) => {
  //     app.close(err => err ? reject(err) : resolve())
  //   })
  // })

  function createLoggerRoute() {
    log = {
      called: false,
      req: null,
      res: null,
    }
    return (req, res) => {
      log.called = true
      log.req = req
      log.res = res
      res.send('OK')
    }
  }

  async function testRoute({name, path, params, post = null} : {name, path, params, post?}) {
    const app = await initApp({[name]: createLoggerRoute()})
    if (post) {
      await (request(app)
        .post(path)
        .send(post))
    } else {
      await request(app)
        .get(path)
    }
    expect(log.called).to.be.true
    expect(log.req.params).to.contain(params)
    
    if (post) {
      expect(log.req.body).to.deep.equal(post)
    }
  }

  it('should route proxy requests correctly', async () => {
    await testRoute({
      name: 'proxy',
      path: '/__/test/one/two',
      params: {url: 'test/one/two'}
    })
   })
   
   it('should route annotation retrievals correctly', async () => {
    await testRoute({
      name: 'retrieveAnnotation',
      path: '/xyz/test.com/foo',
      params: {id: 'xyz', url: 'test.com/foo'}
    })
   })
   
   it('should route annotation uploads correctly', async () => {
    await testRoute({
      name: 'putAnnotation',
      path: '/',
      params: {},
      post: {annotation: {test: 'foo'}}
    })
   })
})
