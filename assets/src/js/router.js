const BrowserRouter = require('browser-app-router')
import * as setup from './setup'
import * as annotation from './annotation'

export function init() {
    console.log('Yello?')

    const router = new BrowserRouter({})
    router.addRoute({
        path: '/demo',
        handler: () => {
            console.log('Display demo!')
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
}
