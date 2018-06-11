import { modifyState, getResource, getState } from '../state'
import { isEmbeddingDisabledOnDeviceSize, isDesktop } from './utils'

export function updateBodyClasses() {
    if (!document.body) {
        return
    }

    if (isDesktop(getState('deviceSizeName'))) {
        document.body.classList.add('desktop-version')
    } else {
        document.body.classList.remove('desktop-version')
    }

    const metadata = getResource('metadata')
    if (metadata) {
        const forceDisableEmbedding = isEmbeddingDisabledOnDeviceSize(getState('deviceSizeName'))
        const embeddable = metadata.embeddable && !forceDisableEmbedding
        const getClassName = embeddable => embeddable ? 'content-embeddable' : 'content-not-embeddable'
        document.body.classList.add(getClassName(embeddable))
        document.body.classList.remove(getClassName(!embeddable))
    }

    if (navigator.userAgent.indexOf('Mac') >= 0) {
        document.body.classList.add('os-mac')
    } else {
        document.body.classList.add('os-not-mac')
    }
}

export function replaceTitle() {
    const domainMatch = getResource('annotation').url.match(/https?:\/\/([^\/]+)\//)
    const domain = domainMatch[1]
    document.title = 'Memex Link: ' + domain
}

export function renderTemplate() {
    document.querySelector('body').innerHTML = getResource('annotationTemplate')
    document.querySelector('.quote .text-content').textContent = getResource('annotation').anchors[0].quote
    document.querySelector('.info .title').textContent = getResource('metadata').title
    document.querySelector('.info .url').textContent = getResource('annotation').url
    modifyState('replacedHTML', true)
}

export function injectIframeIfNeeded() {
    if (!getResource('metadata').embeddable) {
        return
    }

    const url = getResource('annotation').url
    const iframe = document.createElement('iframe')
    iframe.src = url
    document.querySelector('.iframe-container').appendChild(iframe)
}

export function truncateQuote() {
    const quoteCharLimit = 300

    const $quote = document.querySelector('.quote')
    const text = $quote.querySelector('.text-content').textContent
    if (text.length < quoteCharLimit) {
        return
    }

    const lastSpaceBeforeCutoff = text.lastIndexOf(' ', quoteCharLimit)
    const trunctatedText = text.substr(0, lastSpaceBeforeCutoff)

    $quote.classList.add('truncated')
    document.querySelector('.truncated-text .text-content').textContent = trunctatedText
}
