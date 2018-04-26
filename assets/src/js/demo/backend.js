import { fetchResource } from '../state'

export function fetchDemoTemplate() {
    return fetchResource({url: '/assets/inner-demo.html', type: 'text', key: 'demoTemplate'})
}

export function createAnnotationLink() {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve({url: 'http://memex.link/aefdawfe/memex.link/demo'}), 2000)
    })
}
