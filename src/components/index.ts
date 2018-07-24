import * as path from 'path'
import { AnnotationLinkBuilder } from './annotation-link-builder'
import { AnnotationValidator, defaultAnnotationValidator } from './annotation-validator'
import { DocumentRetriever, HttpDocumentRetriever } from './document-retriever'
import { AnnotationSkeletonGenerator } from './annotation-skeleton-generator'
import { HtmlMetadataExtractor } from './metadata-extractor'
import { Storage } from './storage/types'
import { DiskStorage } from './storage/disk'
import { AwsStorage } from './storage';
import { Analytics, AnalyticsDefinition } from './analytics'

export interface AppComponents {
  annotationLinkBuilder : AnnotationLinkBuilder
  annotationSkeletonGenerator : AnnotationSkeletonGenerator
  annotationValidator : AnnotationValidator
  documentRetriever : DocumentRetriever
  metadataExtractor : HtmlMetadataExtractor
  storage : Storage
  analytics: AnalyticsDefinition
}

export interface AppComponentsConfig {
  baseUrl : string
  awsBucket? : string
  overrides? : object
}

export function createAppComponents(config : AppComponentsConfig) : AppComponents {
  function allowOverride<T>(name : string, _default : () => T) : T {
    const override = config.overrides && config.overrides[name]
    return override ? override : _default()
  }

  return {
    annotationLinkBuilder: allowOverride('annotationLinkBuilder', () => new AnnotationLinkBuilder(config)),
    annotationSkeletonGenerator: allowOverride('annotationSkeletonGenerator', () => new AnnotationSkeletonGenerator()),
    annotationValidator: allowOverride('annotationValidator', () => defaultAnnotationValidator),
    documentRetriever: allowOverride('documentRetriever', () => new HttpDocumentRetriever()),
    metadataExtractor: allowOverride('metadataExtractor', () => new HtmlMetadataExtractor()),
    storage: allowOverride('storage', () => {
      if (config.awsBucket) {
        return new AwsStorage({bucketName: config.awsBucket})
      } else {
        return new DiskStorage({
          basePath: path.join(__dirname, '../../public')
        })
      }
    }),
    analytics: allowOverride('analytics', () => new Analytics()),
  }
}
