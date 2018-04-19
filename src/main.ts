require('source-map-support').install()
// import { setupDebugGlobal } from './debug'
import createApp from './express/app'
import { createAppComponents } from './components'
import { createAppRoutes } from './express/routes'
import { createAppControllers } from './controllers'
import { parseCommandLineOptions } from './options'
import { executeDevShortcuts } from './dev-shortcuts'
import { createHttpServer } from './server'
import { setupDevServer } from './dev-server';


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

    // setupDebugGlobal()
    const options = parseCommandLineOptions()
    const components = createAppComponents({baseUrl: process.env.BASE_URL || 'http://localhost:3000'})
    const controllers = createAppControllers(components)
    const routes = createAppRoutes(controllers)
    const app = createApp({ routes, preConfigure: DEVELOPMENT_MODE ? setupDevServer : () => {} })
    const server = await createHttpServer(app)
    if (DEVELOPMENT_MODE) {
      await executeDevShortcuts({components, controllers, config: options.dev})
    }
    console.log('Server started  :)')
    return server
}

if(require.main === module){
  main()
}

// process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: ', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
// });
