import { STATE } from '../state'

export function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', function() {
        copyQuoteAndGoToPage()
    })
}

function copyQuoteAndGoToPage() {
    copyToClipboard(STATE.resources.annotation.content.anchors[0].quote)
    window.location.href = state.annotation.url
}

function copyToClipboard(text){
    var dummy = document.createElement("input")
    document.body.appendChild(dummy)
    dummy.setAttribute('value', text)
    dummy.select()
    document.execCommand("copy")
    document.body.removeChild(dummy)
}
