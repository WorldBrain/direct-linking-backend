import SimpleBreakpoints from 'simple-breakpoints'
import { modifyState, getState } from './state'

export default function observeDeviceSize() {
    const breakpoints = new SimpleBreakpoints()

    modifyState('deviceSizeName', breakpoints.currentBreakpoint())
    console.log('initial', getState('deviceSizeName'))
    breakpoints.on('breakpointChange', (from, to) => {
        console.log('state', getState('deviceSizeName'))
        modifyState('deviceSizeName', to)
    })
}
