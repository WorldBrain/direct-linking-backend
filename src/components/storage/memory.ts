const _ = require('lodash')
import { Annotation } from "../../types/annotations"
import { PageMetadata } from '../../types/metadata'
import { RetrievedDocument, RetrievedDocumentImage } from '../document-retriever'
import { normalizeUrlForSkeletonStorage } from '../../utils/urls'
import { Storage, AnnotationAlreadyExists } from './types'

export class MemoryStorage implements Storage {
    public annotations = {}
    public metadata = {}
    public images = {}
    public documents = {}
    public skeletons = {}
    
    async storeAnnotation({annotation} : {annotation : Annotation}) {
      annotation.id = annotation.id || Object.keys(this.annotations).length.toString()
  
      if (this.annotations[annotation.id]) {
        throw new AnnotationAlreadyExists(annotation.id)
      }
      this.annotations[annotation.id] = annotation
      return {id: annotation.id}
    }
  
    async getAnnotationById(id) {
      return this.annotations[id]
    }
  
    async storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) {
      this.metadata[url] = metadata
    }
  
    async getStoredMetadataForUrl(url : string) {
      return this.metadata[url]
    }
  
    async storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void> {
      this.documents[url] = document
    }
  
    async getCachedDocument(url : string) : Promise<RetrievedDocument> {
      return this.documents[url]
    }
  
    async storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void> {
      this.skeletons[normalizeUrlForSkeletonStorage(annotation.url)] = skeleton
    }

    async getStoredAnnotationSkeleton({annotation} : {annotation : Annotation}) : Promise<string> {
      return this.skeletons[normalizeUrlForSkeletonStorage(annotation.url)]
    }
  }
  