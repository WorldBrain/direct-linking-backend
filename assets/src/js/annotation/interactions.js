import { getResource } from '../state'
import { copyToClipboard } from '../utils'
import { goToDemo } from '../router'

export function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', () => {
        copyQuoteAndMaybeGoToPage()
    })
}

function copyQuoteAndMaybeGoToPage() {
    const annotation = getResource('annotation')
    copyToClipboard(annotation.anchors[0].quote)
    document.querySelector('.copy-button').classList.add('copied')
    if (!getResource('metadata').embeddable) {
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
