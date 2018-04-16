import { Annotation } from '../types/annotations'
import { AppComponents } from '../components'
import { AppControllers } from '../controllers'
import { DevShortcutList } from './types'

export async function createAnnotation({controllers, id, url} : {controllers : AppControllers, id? : string, url : string}) {
    const annotation : Annotation = {
        id,
        url: url || 'https://www.newyorker.com/tech/elements/the-mission-to-decentralize-the-internet',
        anchors: [
            {
                quote: 'Yes, this is not a quote! Muahahaha!'
            }
        ],
    }
    const result = await controllers.putAnnotation({unvalidatedAnnotation: annotation})
    console.log(`Created annotation: ${result.link}`)
}

export default <DevShortcutList>[
    {handler: createAnnotation},
]
