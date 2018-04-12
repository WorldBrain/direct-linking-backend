const _ = require('lodash')
import * as fs from 'fs'
import * as path from 'path'
import * as DataUri from 'datauri'
import { Annotation } from "../types/annotations"
import { PageMetadata } from '../types/metadata'
import { normalizeUrlForStorage } from '../utils/urls';
import { RetrievedDocument, RetrievedDocumentImage } from './document-retriever'
import { AnnotationSkeletonStorage } from './annotation-skeleton-storage'
import { mkdirSyncIfNotExists } from '../utils/fs';

export class AnnotationAlreadyExists extends Error {}

export interface Storage {
  storeAnnotation({annotation} : {annotation : Annotation}) : Promise<{id : string}>
  getAnnotationById(id) : Promise<Annotation>

  storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) : Promise<void>
  getStoredMetadataForUrl(url : string) : Promise<PageMetadata>

  storeDocumentImages({url, images} : {url : string, images : {[type : string]: RetrievedDocumentImage}}) : Promise<void>
  getCachedDocumentImageUrl({url, type} : {url : string, type : string}) : Promise<string>

  storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void>
  getCachedDocument(url : string) : Promise<RetrievedDocument>

  storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void>
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

  async storeDocumentImages({url, images} : {url : string, images : {[type : string]: RetrievedDocumentImage}}) {
    await Promise.all(_.map(images, (image, type) => this.storeDocumentImage({url, type, image})))
  }

  async storeDocumentImage({url, type, image} : {url : string, type : string, image : RetrievedDocumentImage}) {
    const format = image.mime.split('/')[1]
    this.images[url] = this.images[url] || {}
    this.images[url][type] = {content: image.content, format}
  }
  
  async getCachedDocumentImageUrl({url, type}) {
    const image = this.images[url][type]
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

  async storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void> {
    // TODO: Implement so it can can be unit tested
  }
}

export class DiskStorage {
  public basePath : string

  constructor({basePath} : {basePath : string}) {
      this.basePath = basePath
  }

  async storeAnnotation({annotation} : {annotation : Annotation}) {
    annotation.id = annotation.id || this._generateAnnotationId()
    annotation.storageUrl = normalizeUrlForStorage(annotation.url)

    const annotationDir = this._createAnnotationDirIfNecessary({annotation})
    const annotationPath = path.join(annotationDir, 'annotation.json')
    fs.writeFileSync(annotationPath, JSON.stringify(annotationPath))

    return {id: annotation.id}
  }

  async getAnnotationById(id) {
    const filePath = path.join(this.basePath, id, 'annotation.json')
    return JSON.parse(fs.readFileSync(filePath).toString())
  }

  async storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) {
    const urlDir = this._createUrlDirIfNecessary({url})
    const filePath = path.join(urlDir, 'metadata.json')
    fs.writeFileSync(filePath, JSON.stringify(metadata))
  }

  async getStoredMetadataForUrl(url : string) {
    const urlDir = this._getUrlDirPath({url})
    const filePath = path.join(urlDir, 'metadata.json')
    return JSON.parse(fs.readFileSync(filePath).toString())
  }

  async storeDocumentImages({url, images} : {url : string, images : {[type : string]: RetrievedDocumentImage}}) {
    await Promise.all(_.map(images, (image, type) => this.storeDocumentImage({url, type, image})))
  }

  async storeDocumentImage({url, type, image} : {url : string, type : string, image : RetrievedDocumentImage}) {
    const urlDir = this._getUrlDirPath({url})
    const filePath = path.join(urlDir, `image-${type}`)
    fs.writeFileSync(filePath, image.content)
  }
  
  async getCachedDocumentImageUrl({url, type}) {
    const urlDir = this._getUrlDirPath({url})
    const filePath = path.join(urlDir, `image-${type}`)
    return fs.readFileSync(filePath)
  }

  async storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void> {
    const urlDir = this._getUrlDirPath({url})
    const filePath = path.join(urlDir, 'document.json')
    fs.writeFileSync(filePath, JSON.stringify(document))
  }

  async getCachedDocument(url : string) : Promise<RetrievedDocument> {
    const urlDir = this._getUrlDirPath({url})
    const filePath = path.join(urlDir, 'document.json')
    return JSON.parse(fs.readFileSync(filePath).toString())
  }

  async storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void> {
    const annotationDir = this._createAnnotationDirIfNecessary({annotation})  
    const htmlPath = path.join(annotationDir, 'index.html')
    fs.writeFileSync(htmlPath, skeleton)
  }

  _getAnnotationDirPath({annotation} : {annotation : Annotation}) : string {
    return path.join(this.basePath, annotation.id)
  }

  _createAnnotationDirIfNecessary({annotation} : {annotation : Annotation}) : string {
    const annotationDir = this._getAnnotationDirPath({annotation})
    mkdirSyncIfNotExists(annotationDir)
    return annotationDir
  }

  _getUrlDirPath({url}) : string {
    return path.join(this.basePath, url)
  }

  _createUrlDirIfNecessary({url} : {url : string}) : string {
    const urlDir = this._getUrlDirPath({url})
    mkdirSyncIfNotExists(urlDir)
    return urlDir
  }

  _generateAnnotationId() {
    return fs.readdirSync(this.basePath).length.toString()
  }
}
