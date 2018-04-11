import * as DataUri from 'datauri'
import { Annotation } from "../types/annotations"
import { PageMetadata } from '../types/metadata'
import { normalizeUrlForStorage } from '../utils/urls';
import { RetrievedDocument, RetrievedDocumentImage } from './document-retriever';

export class AnnotationAlreadyExists extends Error {}

export interface Storage {
  storeAnnotation({annotation} : {annotation : Annotation}) : Promise<{id : string}>
  getAnnotationById(id) : Promise<Annotation>

  storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) : Promise<void>
  getStoredMetadataForUrl(url : string) : Promise<PageMetadata>

  storeDocumentImage({url, image} : {url : string, image : RetrievedDocumentImage}) : Promise<void>
  getCachedDocumentImageUrl(url : string) : Promise<string>

  storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void>
  getCachedDocument(url : string) : Promise<RetrievedDocument>
}

export class MemoryStorage implements Storage {
  public annotations = {}
  public metadata = {}
  public images = {}
  public documents = {}

  async storeAnnotation({annotation} : {annotation : Annotation}) {
    annotation.id = annotation.id || Object.keys(this.annotations).length.toString()
    annotation.storageUrl = normalizeUrlForStorage(annotation.url)

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

  async storeDocumentImage({url, image} : {url : string, image : RetrievedDocumentImage}) {
    const format = image.mime.split('/')[1]
    this.images[url] = {content: image.content, format}
  }
  
  async getCachedDocumentImageUrl(url : string) {
    const image = this.images[url]
    const dataUri = new DataUri()
    dataUri.format('.' + image.format, image.content)
    return dataUri.content
  }

  async storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void> {
    this.documents[url] = document
  }

  async getCachedDocument(url : string) : Promise<RetrievedDocument> {
    return this.documents[url]
  }
}
