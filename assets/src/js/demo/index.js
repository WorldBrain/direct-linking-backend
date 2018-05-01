import { loader } from '../utils'
import * as state from '../state'
import * as backend from './backend'
import * as actions from './actions'
import * as rendering from './rendering'
import * as interactions from './interactions'

window.demoBackend = backend

export const load = loader(async ({annotationId} = {}) => {
    await Promise.all([
        actions.fetchDemoTemplate(),
        annotationId ? actions.fetchDemoAnnotation({id: annotationId}) : Promise.resolve()
    ])
})

export async function init() {
    state.addStateListener('tooltip', (event => {
        rendering.renderTooltip(state.getState('tooltip'))
    }))
    state.addStateListener('link.progress', (event => {
        rendering.renderLinkCreationProgress({oldProgress: event.oldValue, newProgress: event.newValue})
    }))
    state.addStateListener('link.url', (event => {
        rendering.renderLinkUrl(event.newValue)
    }))

    rendering.renderTemplate()

    const demoAnnotation = state.getResource('demoAnnotation')
    if (demoAnnotation) {
        rendering.highlightAnnotation({annotation: demoAnnotation})
    } else {
        rendering.renderLinkCreationProgress({newProgress: state.getState('link.progress')})
        interactions.setupSelectionHandler()
        interactions.setupCreationLink()
    }
}
