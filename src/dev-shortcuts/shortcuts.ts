import { Annotation } from '../types/annotations'
import { AppComponents } from '../components'
import { AppControllers } from '../controllers'
import { DevShortcutList } from './types'

export async function createAnnotation({controllers, id, url, quote} : {controllers : AppControllers, id? : string, url : string, quote : string}) {
    if (!url || url === 'embeddable') {
        url = 'https://www.newyorker.com/tech/elements/the-mission-to-decentralize-the-internet'
        quote = quote || 'Barlow described a chaotic digital utopia, where “netizens” self-govern and the institutions of old hold no sway. “On behalf of the future, I ask you of the past to leave us alone,” he writes. “You are not welcome among us. You have no sovereignty where we gather.”'
    } else if (url === 'non-embeddable') {
        url = 'https://medium.com/@WorldBrain/where-we-are-heading-with-worldbrain-65f244f540b8'
        quote = 'We want to give people the technologies and mental tools to think for themselves. To make up their own minds.'
    }
    quote = quote || 'Yes, this is not a quote! Muahahaha!'

    const annotation : Annotation = {
        id,
        url,
        anchors: [{quote}],
    }
    const result = await controllers.putAnnotation({unvalidatedAnnotation: annotation})
    console.log(`Created annotation: ${result.link}`)
}

export default <DevShortcutList>[
    {handler: createAnnotation},
]
