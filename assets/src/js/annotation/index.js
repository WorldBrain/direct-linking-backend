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
    state.addStateListener('activeLi', ({ oldValue }) => rendering.updateFeaturesList(oldValue))

    rendering.replaceTitle()
    rendering.renderTemplate()
    rendering.truncateQuote()
    interactions.attachCopyAndGoListener()
    interactions.setupToggleTrunctation()
    interactions.setupLiveDemoButton()
    interactions.setupFeaturesList()
    interactions.setupLazyLoad()
    interactions.setupAccordions()
    rendering.injectIframeIfNeeded()
    rendering.setListActiveClass()
}
