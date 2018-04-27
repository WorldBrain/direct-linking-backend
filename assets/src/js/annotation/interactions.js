import { getResource } from '../state'
import { copyToClipboard } from '../utils'

export function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', function() {
        copyQuoteAndGoToPage()
    })
}

function copyQuoteAndGoToPage() {
    const annotation = getResource('annotation')
    copyToClipboard(annotation.anchors[0].quote)
    window.location.href = annotation.url
}
