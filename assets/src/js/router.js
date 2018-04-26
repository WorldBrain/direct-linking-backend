const BrowserRouter = require('browser-app-router')
import * as setup from './setup'
import * as annotation from './annotation'
import * as demo from './demo'

export function init() {
    const router = new BrowserRouter({})
    router.addRoute({
        path: '/demo',
        handler: async () => {
            await Promise.all([
                setup.injectGoogleFonts(),
                demo.load()
            ])
            demo.init()
        }
    })
    router.set404({
        handler: async () => {
            await Promise.all([
                setup.injectGoogleFonts(),
                annotation.load()
            ])
            annotation.init()
        }
    })
    router.start()

    // Start loading demo in background no matter where we are
    demo.load()
}
