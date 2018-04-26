import { STATE } from '../state'
import { copyToClipboard } from '../utils'

export function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', function() {
        copyQuoteAndGoToPage()
    })
}

function copyQuoteAndGoToPage() {
    copyToClipboard(STATE.resources.annotation.content.anchors[0].quote)
    window.location.href = state.annotation.url
}
