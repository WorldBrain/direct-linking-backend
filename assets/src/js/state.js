import * as objectPath from 'object-path'

export const STATE = {
    resources: {},
    tooltip: {
        position: null,
        active: false
    },
    link: {
        progress: 'pristine',
        url: null,
        error: null
    }
}
window.STATE = STATE

const stateListeners = {}

export function modifyState(key, value) {
    // console.log('State change "%s" from %o to %o', key, state[key], value)
    const oldValue = objectPath.get(STATE, key)
    objectPath.set(STATE, key, value)
    triggerStateListeners(key, oldValue, value)
}

function triggerStateListeners(key, oldValue, newValue) {
    const parts = key.split('.')
    for (const index in parts) {
        const path = parts.slice(0, index + 1).join('.')
        // for key a.b.c, path will be a, a.b, and a.b.c

        for (const listener of stateListeners[path] || []) {
            listener({key, oldValue, newValue})
        }
    }
}

export function addStateListener(key, listener) {
    stateListeners[key] = stateListeners[key] || []
    stateListeners[key].push(listener)
}

export function getState(key) {
    return objectPath.get(STATE, key)
}

export async function fetchResource({url, type, key}) {
    modifyState(`resources.${key}`, {
        progress: 'pristine',
        content: null
    })
    try {
        const response = await fetch(url)
        const data = await response[type].bind(response)()
        modifyState(`resources.${key}.progress`, 'done')
        modifyState(`resources.${key}.content`, data)
    } catch (e) {
        modifyState(`resources.${key}.progress`, 'error')
        modifyState(`resources.${key}.error`, e)
        throw e
    }
}

export function getResource(key) {
    return STATE.resources[key] && STATE.resources[key].content
}
