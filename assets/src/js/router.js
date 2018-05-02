const BrowserRouter = require('browser-app-router')
import * as setup from './setup'
import * as annotation from './annotation'
import * as demo from './demo'

const router = new BrowserRouter({})

export function init() {
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
    router.addRoute({
        path: `/{id}/${window.location.host}/demo/`,
        handler: async (req) => {
            await Promise.all([
                setup.injectGoogleFonts(),
                demo.load({annotationId: req.params.id})
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

export function goToDemo() {
    router.go('/demo')
}
