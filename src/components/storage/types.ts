import { Annotation } from "../../types/annotations"
import { PageMetadata } from '../../types/metadata'
import { RetrievedDocument } from '../document-retriever'

export class AnnotationAlreadyExists extends Error {}

export interface Storage {
    storeAnnotation({annotation} : {annotation : Annotation}) : Promise<{id : string}>
    getAnnotationById(id) : Promise<Annotation>

    storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) : Promise<void>
    getStoredMetadataForUrl(url : string) : Promise<PageMetadata>

    storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void>
    getCachedDocument(url : string) : Promise<RetrievedDocument>

    storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void>
    getStoredAnnotationSkeleton({annotation} : {annotation : Annotation}) : Promise<string>
}
