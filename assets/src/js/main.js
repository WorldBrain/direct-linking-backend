import * as router from './router'
import { injectGoogleFonts } from './setup'

async function main() {
    injectGoogleFonts()
    router.init()
}

main()
