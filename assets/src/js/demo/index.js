import { loader } from '../utils'
import * as state from '../state'
import * as backend from './backend'
import * as rendering from './rendering'
import * as interactions from './interactions'

export const load = loader(async () => {
    state.addStateListener('tooltip', (event => {
        rendering.renderTooltip(state.getState('tooltip'))
    }))
    state.addStateListener('link.progress', (event => {
        rendering.renderLinkCreationProgress({oldProgress: event.oldValue, newProgress: event.newValue})
    }))
    state.addStateListener('link.url', (event => {
        rendering.renderLinkUrl(event.newValue)
    }))

    await Promise.all([
        backend.fetchDemoTemplate(),
    ])
})

export async function init() {
    rendering.renderTemplate()
    rendering.renderLinkCreationProgress({newProgress: state.getState('link.progress')})
    interactions.setupSelectionHandler()
    interactions.setupCreationLink()
}
