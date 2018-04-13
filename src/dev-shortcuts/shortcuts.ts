import { Annotation } from '../types/annotations'
import { AppComponents } from '../components'
import { AppControllers } from '../controllers'
import { DevShortcutList } from './types'

export async function createAnnotation({controllers, id, url} : {controllers : AppControllers, id? : string, url : string}) {
    const annotation : Annotation = {
        id,
        url: url || 'https://medium.com/@WorldBrain/where-we-are-heading-with-worldbrain-65f244f540b8',
        anchors: [],
    }
    const result = await controllers.putAnnotation({unvalidatedAnnotation: annotation})
    console.log(`Created annotation: ${result.link}`)
}

export default <DevShortcutList>[
    {handler: createAnnotation},
]
