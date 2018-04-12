import { AnnotationLinkBuilder } from './annotation-link-builder'
import { AnnotationValidator, defaultAnnotationValidator } from './annotation-validator'
import { DocumentRetriever, SingleDocumentRetriever } from './document-retriever'

export interface AppComponents {
  annotationLinkBuilder : AnnotationLinkBuilder
  annotationValidator : AnnotationValidator
  documentRetriever : DocumentRetriever
}

export interface AppComponentsConfig {
  baseUrl : string
  overrides? : object
}

export function createAppComponents({baseUrl, overrides} : AppComponentsConfig) : AppComponents {
  function allowOverride<T>(name : string, _default : () => T) : T {
    const override = overrides && overrides[name]
    return override ? override() : _default
  }

  return {
    annotationLinkBuilder: allowOverride('annotationLinkBuilder', () => new AnnotationLinkBuilder({baseUrl})),
    annotationValidator: allowOverride('annotationValidator', () => defaultAnnotationValidator),
    documentRetriever: allowOverride('documentRetriever', () => new SingleDocumentRetriever({})),
  }
}
