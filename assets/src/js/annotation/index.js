import { loader } from '../utils'
import * as state from '../state'
import * as actions from './actions'
import * as rendering from './rendering'
import * as interactions from './interactions'

export const load = loader(async () => {
    state.addStateListener('resources', () => rendering.updateBodyClasses())

    await Promise.all([
        actions.fetchAnnotationTemplate(),
        actions.fetchMetadata(),
        actions.fetchAnnotation(),
    ])
})

export async function init() {    
    rendering.replaceTitle()
    rendering.renderTemplate()
    interactions.attachCopyAndGoListener()
    rendering.injectIframeIfNeeded()
}
