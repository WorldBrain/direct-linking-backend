import { modifyState, getState } from '../state'
import { copyToClipboard } from '../utils'
import * as backend from './backend'

export async function requestCreateLinkToClipboard() {
    if (getState('link.progress') !== 'pristine') {
        return
    }

    modifyState('link.progress', 'running')
    
    let result
    try {
        result = await backend.createAnnotationLink()
    } catch (e) {
        modifyState('link.progress', 'error')
        modifyState('link.error', e)
        throw e
    }

    console.log('Received link:', result.url)
    
    modifyState('link.url', result.url)
    modifyState('link.progress', 'done')
}
