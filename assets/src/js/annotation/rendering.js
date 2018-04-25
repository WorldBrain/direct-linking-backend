import { modifyState, getResource } from '../state'

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
        const embeddable = metadata.embeddable ? 'content-embeddable' : 'content-not-embeddable'
        document.body.classList.add(embeddable)
    }
}

export function replaceTitle() {
    const domainMatch = getResource('annotation').url.match(/https?:\/\/([^\/]+)\//)
    const domain = domainMatch[1]
    document.title = 'Memex Link: ' + domain
}

export function renderAnnotationTemplate() {
    console.log('rendering')
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
    iframe.innerHTML = 'Yello there! Is this visible and stylable?'
    document.querySelector('.iframe-container').appendChild(iframe)
}

function replaceTemplateVars(html) {
    html = html.replace('$TITLE$', getResource('metadata').title)
    html = html.replace('$URL$', getResource('annotation').url)
    html = html.replace('$QUOTE$', getResource('annotation').anchors[0].quote)
    return html 
}
