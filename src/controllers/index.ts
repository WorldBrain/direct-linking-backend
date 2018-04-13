import { AppComponents } from '../components'
import * as annotations from './annotations'

export interface AppControllers {
    putAnnotation : Function
}

export function createAppControllers(appComponents : AppComponents) : AppControllers {
    return {
        putAnnotation: annotations.putAnnotation(appComponents)
    }
}
