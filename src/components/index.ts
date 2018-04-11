import { AnnotationLinkBuilder } from './annotation-link-builder'
import { AnnotationStore, MemoryAnnotationStore } from './annotation-store'
import { AnnotationValidator, defaultAnnotationValidator } from './annotation-validator'
import { DocumentRetriever, SingleDocumentRetriever } from './document-retriever'
import { LinkReplacer, RegexLinkReplacer } from './link-replacer'
import { ScriptInjector } from './script-injector'

export interface AppComponents {
  annotationLinkBuilder : AnnotationLinkBuilder
  annotationStore : AnnotationStore
  annotationValidator : AnnotationValidator
  documentRetriever : DocumentRetriever
  linkReplacer : LinkReplacer
  scriptInjector : ScriptInjector
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
    annotationStore: allowOverride('annotationStore', () => new MemoryAnnotationStore()),
    annotationValidator: allowOverride('annotationValidator', () => defaultAnnotationValidator),
    documentRetriever: allowOverride('documentRetriever', () => new SingleDocumentRetriever('test')),
    linkReplacer: allowOverride('linkReplacer', () => new RegexLinkReplacer()),
    scriptInjector: allowOverride('scriptInjector', () => new ScriptInjector())
  }
}
