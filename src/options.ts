const _ = require('lodash')
import * as yargs from 'yargs'
import { DevShortcutCommand, DevShortcutsConfig } from './dev-shortcuts/types'

export function parseCommandLineOptions() {
    const options = yargs
        .array('dev')
        .parse()
    
    options.dev = <DevShortcutsConfig>options.dev.map(configString => {
        const [name, optionsString] = configString.split(':')
        
        let options = {}
        if (optionsString) {
            const optionStrings = optionsString.split(',')
            const optionPairs = optionStrings.map(optionString => optionString.split('='))
            options = _.fromPairs(optionPairs)
        }
        return <DevShortcutCommand>{name, options}
    })

    return options
}
