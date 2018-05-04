import SimpleBreakpoints from 'simple-breakpoints'
import { modifyState, getState } from './state'

export default function observeDeviceSize() {
    const breakpoints = new SimpleBreakpoints()

    modifyState('deviceSizeName', breakpoints.currentBreakpoint())
    breakpoints.on('breakpointChange', (from, to) => {
        modifyState('deviceSizeName', to)
    })
}
