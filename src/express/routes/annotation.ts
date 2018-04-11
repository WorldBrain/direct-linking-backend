import { Annotation } from '../../annotations';
import { AnnotationStore } from '../../components/annotation-store'
import { AnnotationValidator } from '../../components/annotation-validator'
import { AnnotationLinkBuilder } from '../../components/annotation-link-builder'
import { DocumentRetriever } from '../../components/document-retriever'
import { LinkReplacer } from '../../components/link-replacer'
import { ScriptInjector } from '../../components/script-injector'
import * as controllers from '../../controllers/annotation'
import { ExpressReqRes } from '../'

export function retrieveAnnotation(dependencies) {
  const controller = controllers.retrieveAnnotation(dependencies)

  return async function handleAnnotationGetRequest({req, res} : ExpressReqRes) {
    const id = _extractAnnotationIdFromRequest(req)
    const urlWithoutProtocolFromRequest = _extractAnnotationUrlFromRequest(req)
    const result = await controller({id, urlWithoutProtocolFromRequest})
    res.send(result.content)
  }
}

// export type ExpressPutAnnotationExtractor = (req : Express.Request) => {annotation : Annotation, valid : boolean}
export function putAnnotation(dependencies) {
  const controller = controllers.putAnnotation(dependencies)

  return async function handleAnnotationPutRequest({req, res} : ExpressReqRes) {
    const unvalidatedAnnotation = _extractAnnotationFromPutRequest(req)
    const result = await controller({unvalidatedAnnotation})
    res.json(result.link)
  }
}

export function _extractAnnotationIdFromRequest(req) : string {
  return req.params.id
}

export function _extractAnnotationUrlFromRequest(req) : string {
  return req.params.url
}

export function _extractAnnotationFromPutRequest(req) : object {
  return req.body.annotation
}
