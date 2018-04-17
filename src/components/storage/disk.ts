const _ = require('lodash')
import * as fs from 'fs'
import * as path from 'path'
import { Annotation } from "../../types/annotations"
import { PageMetadata } from '../../types/metadata'
import { normalizeUrlForStorage } from '../../utils/urls'
import { RetrievedDocument, RetrievedDocumentImage } from '../document-retriever'
import { mkdirSyncIfNotExists, mkdirPathSync } from '../../utils/fs'
import { Storage } from './types'

export class DiskStorage implements Storage {
    public basePath : string
  
    constructor({basePath} : {basePath : string}) {
        this.basePath = basePath
    }
  
    async storeAnnotation({annotation} : {annotation : Annotation}) {
      annotation.id = annotation.id || this._generateAnnotationId()
      annotation.storageUrl = normalizeUrlForStorage(annotation.url)
  
      const annotationDir = this._createAnnotationDirIfNecessary({annotation})
      const annotationPath = path.join(annotationDir, 'annotation.json')
      fs.writeFileSync(annotationPath, JSON.stringify(annotation))
  
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
      const urlDir = encodeURIComponent(url)
      const filePath = path.join(urlDir, `image-${type}`)
      return '/' + filePath
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
      if (!annotation.storageUrl) {
        // TODO: Throw an error?
      }
      const htmlDir = path.join(annotationDir, annotation.storageUrl)
      mkdirPathSync(htmlDir)
      const htmlPath = path.join(htmlDir, 'index.html')
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
      return path.join(this.basePath, encodeURIComponent(url))
    }
  
    _createUrlDirIfNecessary({url} : {url : string}) : string {
      const urlDir = this._getUrlDirPath({url})
      mkdirPathSync(urlDir)
      return urlDir
    }
  
    _generateAnnotationId() {
      return fs.readdirSync(this.basePath).length.toString()
    }
  }
  