import { getState, getResource, modifyState } from '../state'
import { copyToClipboard } from '../utils'
import { goToDemo } from '../router'
import { isEmbeddingDisabledOnDeviceSize } from './utils'
import { lazyLoadFeatureImages } from './rendering'

export function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', event => {
        event.preventDefault()
        copyQuoteAndMaybeGoToPage()
    })
}

function copyQuoteAndMaybeGoToPage() {
    const forceDisableEmbedding = isEmbeddingDisabledOnDeviceSize(getState('deviceSizeName'))
    const annotation = getResource('annotation')
    copyToClipboard(annotation.anchors[0].quote)
    document.querySelector('.copy-button').classList.add('copied')
    if (!getResource('metadata').embeddable || forceDisableEmbedding) {
        window.location.href = annotation.url
    }
}

export function setupToggleTrunctation() {
    document.querySelector('.enable-truncation').addEventListener('click', () => {
        document.querySelector('.quote').classList.remove('show-more')
    })
    document.querySelector('.disable-truncation').addEventListener('click', () => {
        document.querySelector('.quote').classList.add('show-more')
    })
}


export function setupLiveDemoButton() {
    document.querySelector('.btn-live-demo').addEventListener('click', () => {
        goToDemo()
    })
}

export function setupFeaturesList() {
    document.querySelector('.features-list').addEventListener('click', (e) => {
        e.preventDefault()
        const listId = parseInt(e.target.dataset.listId, 10)

        if(isNaN(listId))
            return

        modifyState('activeLi', listId)
    })
}

export function setupLazyLoad() {
    document.addEventListener('scroll', (e) => {
        setTimeout(() => {
            lazyLoadFeatureImages()            
        }, 150);
    })
}