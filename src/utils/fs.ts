import * as fs from 'fs'

export function mkdirSyncIfNotExists(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}