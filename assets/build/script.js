const state = {
    fetchingHTML: 'pristine',
    replacedHTML: false,
    innerHTMLTemplate: null,

    fetchingMetadata: 'pristine',
    metadata: null,

    fetchingAnnotation: 'pristine',
    annotation: null
}

function modifyState(key, value) {
    // console.log('State change "%s" from %o to %o', key, state[key], value)
    state[key] = value
    updateBodyClasses()
}

function updateBodyClasses() {
    const body = document.querySelector('body')
    
    const loading = !(state.fetchingHTML === 'done' && state.fetchMetadata === 'done' && state.fetchAnnotation === 'done')
    if (!loading) {
        body.classList.remove('loading')
    }

    if (state.metadata) {
        const embeddable = state.metadata.embeddable ? 'content-embeddable' : 'content-not-embeddable'
        body.classList.add(embeddable)
    }
}

function deduceDocumentUrlWithoutProtocol() {
    const curPath = window.location.pathname
    const url = curPath.split('/').slice(2).join('/')
    const withoutTrailingSlash = url.substr(url.length - 1) === '/' ? url.slice(0, -1) : url
    return withoutTrailingSlash
}

function deduceMetadataUrl() {
    return '/' + encodeURIComponent(encodeURIComponent(deduceDocumentUrlWithoutProtocol())) + '/metadata.json'
}

function deduceDocumentUrl() {
    return 'http://' + deduceDocumentUrlWithoutProtocol()
}

function deduceAnnotationUrl() {
    const curPath = window.location.pathname
    const id = curPath.split('/')[1]
    const url = '/' + id + '/annotation.json'
    return url
}

function fetchResource(url, type, progressKey, contentKey) {
    modifyState(progressKey, 'running')

    return fetch(url)
        .then(function(response) { return response[type].bind(response)() })
        .then(function(metadata) {
            modifyState(progressKey, 'done')
            modifyState(contentKey, metadata)
        })
}

function fetchMetadata() {
    return fetchResource(deduceMetadataUrl(), 'json', 'fetchingMetadata', 'metadata')
}

function fetchInnerHTML() {
    return fetchResource('/assets/inner.html', 'text', 'fetchingHTML', 'innerHTMLTemplate')
}

function fetchAnnotation() {
    return fetchResource(deduceAnnotationUrl(), 'json', 'fetchingAnnotation', 'annotation')
}

function replaceTemplateVars(html) {
    html = html.replace('$TITLE$', state.metadata.title)
    html = html.replace('$URL$', state.annotation.url)
    html = html.replace('$QUOTE$', state.annotation.anchors[0].quote)
    return html 
}

function replaceInnerHTML() {
    document.querySelector('body').innerHTML = replaceTemplateVars(state.innerHTMLTemplate)
    modifyState('replacedHTML', true)
}

function injectIframe() {
    const url = deduceDocumentUrl()
    const iframe = document.createElement('iframe')
    iframe.src = url
    iframe.innerHTML = 'Yello there! Is this visible and stylable?'
    document.querySelector('.iframe-container').appendChild(iframe)
}

function injectGoogleFonts() {
    return new Promise(function (resolve, reject) {
        window.WebFontConfig = {
            google: { families: ['Lato'] },
            active: resolve,
            inactive: resolve
         };
      
         (function(d) {
            var wf = d.createElement('script'), s = d.scripts[0];
            wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
            wf.async = true;
            s.parentNode.insertBefore(wf, s);
        })(document);
    })
}

function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', function() {
        copyQuoteAndGoToPage()
    })
}

function copyQuoteAndGoToPage() {
    copyToClipboard(state.annotation.anchors[0].quote)
    window.location.href = state.annotation.url
}

function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

Promise.all([
    fetchInnerHTML(),
    fetchMetadata(),
    fetchAnnotation(),
    injectGoogleFonts(),
]).then(function() {
    replaceInnerHTML()
    attachCopyAndGoListener()
    if (state.metadata.embeddable) {
        injectIframe()
    }
})
