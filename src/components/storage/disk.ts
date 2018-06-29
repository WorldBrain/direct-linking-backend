const _ = require('lodash')
import * as fs from 'fs'
import * as path from 'path'
import { Annotation } from "../../types/annotations"
import { PageMetadata } from '../../types/metadata'
import { normalizeUrlForSkeletonStorage, normalizeUrlForMetadataStorage } from '../../utils/urls'
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
      const isDir = annotation.url.substr(-1) === '/'
      const annotationDir = this._createAnnotationDirIfNecessary({annotation})
      const normalizedUrl = normalizeUrlForSkeletonStorage(annotation.url)

      let subDir, fileName
      if (isDir) {
        subDir = normalizedUrl
        fileName = 'index.html'
      } else {
        const parts = normalizedUrl.split('/')
        subDir = parts.slice(0, -1).join('/')
        fileName = parts.slice(-1)[0]
        console.log(parts, '|', subDir)
      }

      const htmlDir = path.join(annotationDir, subDir)
      mkdirPathSync(htmlDir)
      const htmlPath = path.join(htmlDir, fileName)
      fs.writeFileSync(htmlPath, skeleton)
    }

    async getStoredAnnotationSkeleton({annotation} : {annotation : Annotation}) : Promise<string> {
      const annotationDir = this._getAnnotationDirPath({annotation})
      const htmlDir = path.join(annotationDir, normalizeUrlForSkeletonStorage(annotation.url))
      const htmlPath = path.join(htmlDir, 'index.html')
      return fs.readFileSync(htmlPath).toString()
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
      return path.join(this.basePath, encodeURIComponent(normalizeUrlForMetadataStorage(url)))
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
  