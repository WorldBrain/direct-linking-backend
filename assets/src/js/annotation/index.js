import { loader } from '../utils'
import * as state from '../state'
import * as actions from './actions'
import * as rendering from './rendering'
import * as interactions from './interactions'
import { getAnnotationId } from './utils'
import { trackEvent } from './backend'

export const load = loader(async () => {
    const id = getAnnotationId()

    await Promise.all([
        actions.fetchAnnotationTemplate(),
        actions.fetchMetadata(),
        actions.fetchAnnotation(),
        trackEvent({id, type: 'view-memex-link'}),
    ])
})

export async function init() {    
    rendering.updateBodyClasses()
    state.addStateListener('resources', () => rendering.updateBodyClasses())
    state.addStateListener('deviceSizeName', () => rendering.updateBodyClasses())
    state.addStateListener('activeFeature', ({ oldValue }) => rendering.updateFeaturesList(oldValue))

    rendering.replaceTitle()
    rendering.renderTemplate()
    rendering.truncateQuote()
    interactions.attachCopyAndGoListener()
    interactions.setupToggleTrunctation()
    interactions.setupLiveDemoButton()
    interactions.setupDownloadButton()
    interactions.setupFeaturesList()
    interactions.setupLazyLoad()
    interactions.setupAccordions()
    rendering.injectIframeIfNeeded()
    rendering.setListActiveClass()
}
