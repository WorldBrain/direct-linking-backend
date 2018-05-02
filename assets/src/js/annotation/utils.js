export function deduceDocumentUrlWithoutProtocol() {
    const curPath = window.location.pathname
    const url = curPath.split('/').slice(2).join('/')
    const withoutTrailingSlash = url.substr(url.length - 1) === '/' ? url.slice(0, -1) : url
    return withoutTrailingSlash
}

export function deduceMetadataUrl() {
    return '/' + encodeURIComponent(encodeURIComponent(deduceDocumentUrlWithoutProtocol())) + '/metadata.json'
}

export function deduceDocumentUrl() {
    return 'http://' + deduceDocumentUrlWithoutProtocol()
}

export function deduceAnnotationUrl() {
    const curPath = window.location.pathname
    const id = curPath.split('/')[1]
    const url = '/' + id + '/annotation.json'
    return url
}