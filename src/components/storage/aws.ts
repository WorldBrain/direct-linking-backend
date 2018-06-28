import * as AWS from 'aws-sdk'
const _ = require('lodash')
import * as shortid from 'shortid'
import * as promiseRetry from 'promise-retry'
import { Annotation } from "../../types/annotations"
import { PageMetadata } from '../../types/metadata'
import { normalizeUrlForMetadataStorage, normalizeUrlForSkeletonStorage } from '../../utils/urls'
import { RetrievedDocument } from '../document-retriever'
import { Storage } from './types'

export interface AwsStorageConfig {
  bucketName : string
  bucketRegion : string
}

export class AwsStorage implements Storage {
  public _s3
  public bucketName : string

  constructor({bucketName} : {bucketName : string}) {
    AWS.config.update({region: process.env.AWS_REGION})
    this._s3 = new AWS.S3({apiVersion: '2006-03-01'})
    this.bucketName = bucketName
  }

  async storeAnnotation({annotation} : {annotation : Annotation}) {
    annotation.id = await this._generateAnnotationId()
    
    const key = annotation.id + '/annotation.json'
    await this._putObject({key, body: annotation, type: 'json'})

    return {id: annotation.id}
  }

  async getAnnotationById(id) {
    const key = id + '/annotation.json'
    return await this._getObject({key, type: 'json'})
  }

  async storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) {
    const key = encodeURIComponent(normalizeUrlForMetadataStorage(url)) + '/metadata.json';
    await this._putObject({key, body: metadata, type: 'json'})
  }

  async getStoredMetadataForUrl(url : string) {
    const key = encodeURIComponent(normalizeUrlForMetadataStorage(url)) + '/metadata.json'
    return await this._getObject({key, type: 'json'})
  }

  async storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void> {
    const key = encodeURIComponent(normalizeUrlForMetadataStorage(url)) + '/document.json'
    await this._putObject({key, body: document, type: 'json'})
  }

  async getCachedDocument(url : string) : Promise<RetrievedDocument> {
    const key = encodeURIComponent(normalizeUrlForMetadataStorage(url)) + '/document.json'
    return await this._getObject({key, type: 'json'})
  }

  async storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void> {
    const isDir = annotation.url.substr(-1) === '/'
    let key = `${annotation.id}/${normalizeUrlForSkeletonStorage(annotation.url)}`
    if (isDir) {
      key += '/index.html'
    }
    await this._putObject({key, body: skeleton, type: 'html'})
  }

  async getStoredAnnotationSkeleton({annotation} : {annotation : Annotation}) {
    const key = `${annotation.id}/${normalizeUrlForSkeletonStorage(annotation.url)}/index.html`
    return await this._getObject({key, type: 'text'})
  }

  async _getObject({key, type} : {key : string, type? : 'json' | 'text'}) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    }

    const data = await new Promise((resolve, reject) => {
      this._s3.getObject(params, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })

    if (type === 'text') {
      return data['Body'].toString()
    }
    if (type === 'json') {
      return JSON.parse(data['Body'])
    }
    return data
  }

  async _putObject(params : {key : string, body, type? : 'html' | 'json' | 'buffer', mime? : string}) {
    await promiseRetry((retry, number) => {
      return this._putObjectDirectly(params).catch(retry)
    })
  }

  async _putObjectDirectly({key, body, type, mime} : {key : string, body, type? : 'html' | 'json' | 'buffer', mime? : string}) {
    if (type === 'json') {
      body = JSON.stringify(body)
    }

    const contentType = mime || {
      json: 'application/json',
      html: 'text/html',
      'image-png': 'image/png',
      'image-jpg': 'image/jpeg'
    }[type]
    const params = {
      ACL: 'public-read',
      Key: key,
      Body: body,
      Bucket: this.bucketName,
      ContentType: contentType
    }

    const method = type === 'buffer' ? 'upload' : 'putObject'
    await new Promise((resolve, reject) => {
      this._s3[method].bind(this._s3)(params, (err, data) => {
        err ? reject(err) : resolve()
      })
    })
  }

  async _generateAnnotationId() {
    const id = shortid.generate()
    const isFree = _isPathFree(this._s3, this.bucketName, id + '/annotation.json');
    return isFree ? id : await this._generateAnnotationId()
  }
}

function _isPathFree(s3, bucket, key) {
  return s3.headObject({Bucket: bucket, Key: key}).promise()
    .then(() => Promise.resolve(false))
    .catch(function (err) {
      if (err.code == 'NotFound') {
        return Promise.resolve(true)
      } else {
        return Promise.reject(err)
      }
    })
}
