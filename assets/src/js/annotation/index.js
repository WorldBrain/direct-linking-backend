import { loader } from '../utils'
import * as state from '../state'
import * as actions from './actions'
import * as rendering from './rendering'
import * as interactions from './interactions'

export const load = loader(async () => {
    await Promise.all([
        actions.fetchAnnotationTemplate(),
        actions.fetchMetadata(),
        actions.fetchAnnotation(),
    ])
})

export async function init() {    
    rendering.updateBodyClasses()
    state.addStateListener('resources', () => rendering.updateBodyClasses())
    state.addStateListener('deviceSizeName', () => rendering.updateBodyClasses())

    rendering.replaceTitle()
    rendering.renderTemplate()
    rendering.truncateQuote()
    interactions.attachCopyAndGoListener()
    interactions.setupToggleTrunctation()
    interactions.setupLiveDemoButton()
    rendering.injectIframeIfNeeded()
}
