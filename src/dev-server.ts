import * as path from 'path'
import * as express from 'express'
const serveStatic = require('serve-static')
import * as livereload from 'livereload'

export function setupDevServer(expressApp) {
    const publicPath = path.join(__dirname, '../public')
    expressApp.use(require('connect-livereload')({
        port: 35729
    }))
    expressApp.use(serveStatic(publicPath))
    // livereload.createServer().watch(publicPath)
}
