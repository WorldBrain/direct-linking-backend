import * as state from '../state'
import * as loading from './loading'
import * as rendering from './rendering'
import * as interactions from './interactions'

export async function load() {
    state.addStateListener('resources', () => rendering.updateBodyClasses())

    await Promise.all([
        loading.fetchAnnotationTemplate(),
        loading.fetchMetadata(),
        loading.fetchAnnotation(),
    ])
}

export async function init() {    
    rendering.replaceTitle()
    rendering.renderAnnotationTemplate()
    interactions.attachCopyAndGoListener()
    rendering.injectIframeIfNeeded()
}
