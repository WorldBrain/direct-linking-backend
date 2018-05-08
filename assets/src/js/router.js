const BrowserRouter = require('browser-app-router')
import * as setup from './setup'
import * as annotation from './annotation'
import * as demo from './demo'
import { bodyLoader } from './utils'

const router = new BrowserRouter({})
let loadingInnerHTML = null

export function init() {
    const indicateLoading = () => {
        if (loadingInnerHTML) {
            document.body.innerHTML = loadingInnerHTML
        } else {
            loadingInnerHTML = document.body.innerHTML
        }
        document.body.classList.add('loading')
    }
    const finishLoading = () => {
        document.body.classList.remove('loading')
    }
    const load = async promise => {
        await bodyLoader()
        if (!promise.loaded) {
            indicateLoading()
            await promise
        }
        finishLoading()
    }

    router.addRoute({
        path: '/demo',
        handler: async () => {
            await load(Promise.all([
                setup.injectGoogleFonts(),
                demo.load()
            ]))
            demo.init()
        }
    })
    router.addRoute({
        path: `/{id}/${window.location.host}/demo/`,
        handler: async (req) => {
            await load(Promise.all([
                setup.injectGoogleFonts(),
                demo.load({annotationId: req.params.id})
            ]))
            demo.init()
        }
    })
    router.set404({
        handler: async () => {
            await load(Promise.all([
                setup.injectGoogleFonts(),
                annotation.load()
            ]))
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
