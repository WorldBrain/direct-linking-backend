export function deduceDocumentDirWithoutProtocol({withQuery = true} = {}) {
    const curPath = window.location.pathname
    let url = curPath.split('/').slice(2).join('/')
    console.log(withQuery, window.location.search)
    if (withQuery && window.location.search) {
        url += window.location.search
    } else {
        // Strip only one trailing slash
        while (url.substr(url.length - 1) === '/') {
            url = url.slice(0, -1)
        }
    }
    return url
}

export function deduceMetadataUrl() {
    function path(withQuery) {
        return '/' + encodeURIComponent(encodeURIComponent(deduceDocumentDirWithoutProtocol({withQuery}))) + '/metadata.json'
    }
    return [path(true), path(false)]
}

export function deduceAnnotationUrl() {
    const curPath = window.location.pathname
    const id = curPath.split('/')[1]
    const url = '/' + id + '/annotation.json'
    return url
}

export function isEmbeddingDisabledOnDeviceSize(deviceSizeName) {
    return ['mobile', 'tablet', 'small_desktop'].indexOf(deviceSizeName) >= 0
}

export function isDesktop(deviceSizeName) {
    return deviceSizeName.indexOf('desktop') >= 0
}
