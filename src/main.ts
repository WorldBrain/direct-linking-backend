require('source-map-support').install()
// require('regenerator-runtime/runtime')
// import * as _ from 'lodash'
// import * as path from 'path'
import * as http from 'http'
import createApp from './express/app'
import { createAppComponents } from './components/index';
import { createAppRoutes } from './express/routes/index';


const DEVELOPMENT_MODE = process.env.NODE_ENV === 'dev';


export async function setup() {

}


export async function main(config = null) : Promise<any> {
  // if (!config) {
  //   try {
  //     config = require('../config.json')
  //   } catch(e) {
  //     if (DEVELOPMENT_MODE) {
  //       config = {
  //         sessionSecret: 'dev session secret'
  //       }
  //     } else {
  //       throw e
  //     }
  //   }
  // }

    const components = createAppComponents({baseUrl: 'http://localhost:3000'})
    const routes = createAppRoutes(components)
    const app = createApp({routes})

    const server = http.createServer(app)
    await new Promise((resolve, reject) => {
      server.listen(parseInt(process.env.PORT) || 5678, (err) => {
        if (err) { return reject(err) }
        resolve(server)
      })
    })

    return server
}

if(require.main === module){
  main()
}

// process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: ', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
// });
