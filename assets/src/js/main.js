import '@babel/polyfill'
import * as router from './router'
import { injectGoogleFonts } from './setup'
import observeDeviceSize from './device-size'

async function main() {
    injectGoogleFonts()
    observeDeviceSize()
    router.init()
}

main()
