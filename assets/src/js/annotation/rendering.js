import { modifyState, getResource, getState } from '../state'
import { deduceDocumentUrl } from './utils'

const DISABLE_EMBEDDED_ON_SIZES = ['mobile', 'tablet', 'small_desktop']

export function updateBodyClasses() {
    if (!document.body) {
        return
    }

    const loading = !!getResource('innerHTML') && !!getResource('metadata') && !!getResource('annotation')
    if (!loading) {
        document.body.classList.remove('loading')
    }

    const metadata = getResource('metadata')
    if (metadata) {
        const forceDisableEmbedding = DISABLE_EMBEDDED_ON_SIZES.indexOf(getState('deviceSizeName')) >= 0
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
    document.querySelector('body').innerHTML = replaceTemplateVars(getResource('annotationTemplate'))
    modifyState('replacedHTML', true)
}

export function injectIframeIfNeeded() {
    if (!getResource('metadata').embeddable) {
        return
    }

    const url = deduceDocumentUrl()
    const iframe = document.createElement('iframe')
    iframe.src = url
    document.querySelector('.iframe-container').appendChild(iframe)
}

function replaceTemplateVars(html) {
    html = html.replace('$TITLE$', getResource('metadata').title)
    html = html.replace('$URL$', getResource('annotation').url)
    html = html.replace('$QUOTE$', getResource('annotation').anchors[0].quote)
    return html 
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
    document.querySelector('.truncated-text .text-content').innerHTML = trunctatedText
}
