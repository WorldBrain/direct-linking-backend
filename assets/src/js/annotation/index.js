import { loader } from '../utils'
import * as state from '../state'
import * as backend from './backend'
import * as rendering from './rendering'
import * as interactions from './interactions'

export const load = loader(async () => {
    state.addStateListener('resources', () => rendering.updateBodyClasses())

    await Promise.all([
        backend.fetchAnnotationTemplate(),
        backend.fetchMetadata(),
        backend.fetchAnnotation(),
    ])
})

export async function init() {    
    rendering.replaceTitle()
    rendering.renderTemplate()
    interactions.attachCopyAndGoListener()
    rendering.injectIframeIfNeeded()
}
