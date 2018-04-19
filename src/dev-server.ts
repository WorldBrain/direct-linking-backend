import * as fs from 'fs'
import * as path from 'path'
import * as shell from 'shelljs'
import { mkdirPathSync } from './utils/fs';

export function setupDevServer(expressApp) {
    const dependencies = _importDevDependencies()

    const assetsPath = path.join(__dirname, '../assets')
    const publicPath = path.join(__dirname, '../public')
    
    expressApp.use(require('connect-livereload')({
        port: 35729
    }))
    expressApp.use(dependencies.serveStatic(publicPath))
    dependencies.livereload.createServer().watch(publicPath)

    // On startup, update all assets
    const knownAssets = ['src/styles.less', 'build/styles.css', 'build/script.js', 'build/inner.html', 'build/logo.png', 'build/memex.png']
    for (const asset of knownAssets) {
        handleAssetEvent({dependencies, assetsPath, publicPath, event: 'update', fromPath: `assets/${asset}`})
    }
    
    dependencies.watch(assetsPath, {recursive: true}, (event, fromPath) => {
        handleAssetEvent({dependencies, assetsPath, publicPath, event, fromPath})
    })
}

function handleAssetEvent({assetsPath, publicPath, fromPath, dependencies, event}) {
    const relPath = path.relative(assetsPath, fromPath)
    const toPublicPath = path.join(publicPath, relPath).replace(/src|build\//, '')
    
    const isBuilt = relPath.indexOf('build') >= 0
    if (isBuilt) {
        mirrorFromBuildToPublic(event, fromPath, toPublicPath)
        return
    }

    const toBuildPath = fromPath.replace('src', 'build')
    if (/\.less$/.test(toBuildPath)) {
        recompileCSS(fromPath, toBuildPath.replace('.less', '.css'), dependencies)
    } else {
        console.warn("Don't know how to deal with asset source:", relPath)
    }
}

function mirrorFromBuildToPublic(event, fromPath, toPath) {
    if (event === 'update') {
        mkdirPathSync(path.dirname(toPath))
        const isDir = fs.statSync(fromPath).isDirectory()
        shell.cp('-r', fromPath, toPath)
    } else if (event === 'remove') {
        shell.rm('-r', toPath)
    } else {
        // There are no other events I've observed playing around
    }
}

function recompileCSS(fromPath, toPath, dependencies) {
    fs.readFile(fromPath, (err, css) => {
        dependencies.postcss([dependencies.precss, dependencies.autoprefixer])
            .process(css, { from: fromPath, to: toPath })
            .then(result => {
                fs.writeFileSync(toPath, result.css);
                if ( result.map ) fs.writeFileSync(`${toPath}.map`, result.map);
            });
    });
}

export function _importDevDependencies() {
    return {
        watch: require('node-watch'),
        serveStatic: require('serve-static'),
        livereload: require('livereload'),
        postcss: require('postcss'),
        precss: require('precss'),
        autoprefixer: require('autoprefixer')
    }
}
