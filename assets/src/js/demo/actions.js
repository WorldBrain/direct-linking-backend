import { modifyState, getState, fetchResource } from '../state'
import { copyToClipboard } from '../utils'
import * as backend from './backend'

export async function requestCreateLinkToClipboard({anchor}) {
    if (getState('link.progress') !== 'pristine') {
        return
    }

    modifyState('link.progress', 'running')
    
    let result
    try {
        result = await backend.createAnnotationLink({anchor})
    } catch (e) {
        modifyState('link.progress', 'error')
        modifyState('link.error', e)
        throw e
    }

    modifyState('link.url', result.url)
    modifyState('link.progress', 'done')
}

export function fetchDemoTemplate() {
    return fetchResource({url: '/assets/inner-demo.html', type: 'text', key: 'demoTemplate'})
}

export function fetchDemoAnnotation({id}) {
    return fetchResource({url: `/${id}/annotation.json`, type: 'json', key: 'demoAnnotation'})
}
