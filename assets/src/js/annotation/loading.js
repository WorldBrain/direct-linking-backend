import { fetchResource } from '../state'
import { deduceMetadataUrl, deduceAnnotationUrl } from './utils'

export function fetchMetadata() {
    return fetchResource({url: deduceMetadataUrl(), type: 'json', key: 'metadata'})
}

export function fetchAnnotationTemplate() {
    return fetchResource({url: '/assets/inner-annotation.html', type: 'text', key: 'annotationTemplate'})
}

export function fetchAnnotation() {
    return fetchResource({url: deduceAnnotationUrl(), type: 'json', key: 'annotation'})
}
