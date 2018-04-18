import * as AWS from 'aws-sdk'
const _ = require('lodash')
import * as fs from 'fs'
import * as path from 'path'
import { Annotation } from "../../types/annotations"
import { PageMetadata } from '../../types/metadata'
import { normalizeUrlForStorage } from '../../utils/urls'
import { RetrievedDocument, RetrievedDocumentImage } from '../document-retriever'
import { mkdirSyncIfNotExists, mkdirPathSync } from '../../utils/fs'
import { Storage } from './types'
import { S3 } from 'aws-sdk';

export interface AwsStorageConfig {
  bucketName : string
  bucketRegion : string
}

export class AwsStorage implements Storage {
  public _s3
  public aws_config
  public basePath : string

  constructor({config, basePath} : {config : AwsStorageConfig, basePath : string}) {
    AWS.config.update({region: 'eu-west-1'})
    this._s3 = new AWS.S3({apiVersion: '2006-03-01'})
    this.aws_config = config
  }

  async storeAnnotation({annotation} : {annotation : Annotation}) {
    annotation.id = annotation.id
    annotation.storageUrl = normalizeUrlForStorage(annotation.url)
    const params = {
      Body: JSON.stringify(annotation),
      Bucket: this.aws_config.bucketName,
      ServerSideEncryption: "AES256",
      Key: annotation.id,
    }
    AWS.S3.putObject(params, function(err, data) {
      if (err)
        console.log(err, err.stack)
      else
        console.log(data)
    })

    return {id: annotation.id}
  }

  async getAnnotationById(id) {
    const params = {
      Bucket: this.aws_config.bucketName,
      Key: id,
    }
    const data = await new Promise((resolve, reject) => {
      AWS.S3.getObject(params, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
    return data.Body
  }

  async storeMetadata({url, metadata} : {url : string, metadata : PageMetadata}) {
    const params = {
      Body: JSON.stringify(metadata),
      Bucket: this.aws_config.bucketName,
      Key: url + '-meta',
      ServerSideEncryption: "AES256",
    }
    AWS.S3.putObject(params, function(err, data) {
      if (err)
        console.log(err)
      else
        console.log(data)
    })
  }

  async getStoredMetadataForUrl(url : string) {
    const params = {
      Bucket: this.aws_config.bucketName,
      Key: url,
    }
    const data = await new Promise((resolve, reject) => {
      AWS.S3.getObject(params, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
    return data.Body
  }

  async storeDocumentImages({url, images} : {url : string, images : {[type : string]: RetrievedDocumentImage}}) {
    await Promise.all(_.map(images, (image, type) => this.storeDocumentImage({url, type, image})))
  }

  async storeDocumentImage({url, type, image} : {url : string, type : string, image : RetrievedDocumentImage}) {
    const params = {
      Key: path.join(url, `-image-${type}`),
      Body: image,
      Bucket: this.aws_config.bucketName,
    }
    AWS.S3.upload(params, function(err, data) {
      console.log(err, data)
    })
  }
  
  async getCachedDocumentImageUrl({url, type}) {
    return 'http://' + this.aws_config.bucketName + '.s3-website.' + this.aws_config.bucketRegion + '.amazonaws.com/' + url
  }

  async storeDocument({url, document} : {url : string, document : RetrievedDocument}) : Promise<void> {
    const params = {
      Bucket: this.aws_config.bucketName,
      Key: url + '-document',
      Body: JSON.stringify(document),
    }
    AWS.S3.putObject(params, function(err, data) {
      console.log(err, data)
    })
  }

  async getCachedDocument(url : string) : Promise<RetrievedDocument> {
    const params = {
      Bucket: this.aws_config.bucketName,
      Key: url + '-document',
    }
    const data = await new Promise((resolve, reject) => {
      AWS.S3.getObject(params, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
    return data.Body
  }

  async storeAnnotationSkeleton({annotation, skeleton} : {annotation : Annotation, skeleton : string}) : Promise<void> {
    const params = {
      Key: 'skeleton_' + annotation.id,
      Body: skeleton,
    }
    AWS.S3.putObject(params, function(err, data) {
      console.log(err, data)
    })
  }
}
