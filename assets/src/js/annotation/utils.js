const API_HOST = process.env.TIER === 'production'
    ? 'https://2s1jj0js02.execute-api.eu-central-1.amazonaws.com/production'
    : 'https://a8495szyaa.execute-api.eu-central-1.amazonaws.com/staging'

const API_PATH = '/event'
const JSON_HEADER = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
}

export function deduceDocumentUrlWithoutProtocol() {
    const curPath = window.location.pathname
    const url = curPath.split('/').slice(2).join('/')
    const withoutTrailingSlash = url.substr(url.length - 1) === '/' ? url.slice(0, -1) : url
    return withoutTrailingSlash
}

export function deduceMetadataUrl() {
    return '/' + encodeURIComponent(encodeURIComponent(deduceDocumentUrlWithoutProtocol())) + '/metadata.json'
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
function getAnnotationId() {
    const curPath = window.location.pathname
    return curPath.split('/')[1]
}

export async function trackEvent() {
    const id = getAnnotationId()
    const data = {
        id,
        data: [{
            type: 'memex.link',
            time: Date.now(),
        }]
    }

    console.log(API_HOST + API_PATH, {
        method: 'POST',
        headers: JSON_HEADER,
        body: data,
    })
    console.log(data)

    const res = await fetch(API_HOST + API_PATH, {
        method: 'POST',
        headers: JSON_HEADER,
        body: data,
    })
}
