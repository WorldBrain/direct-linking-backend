import { AppComponents } from '../../components/index'
import * as annotationRoutes from './annotation'
import * as proxyRoutes from './proxy'

export type RouteHandler = ({req, res}) => void

export interface AppRoutes {
  proxy : RouteHandler
  retrieveAnnotation : RouteHandler
  putAnnotation : RouteHandler
}

export function createAppRoutes(appComponents : AppComponents) : AppRoutes {
  return {
    proxy: proxyRoutes.proxyGetRequest({}),
    retrieveAnnotation: annotationRoutes.retrieveAnnotation({
      annotationStore: appComponents.annotationStore,
      linkReplacer: appComponents.linkReplacer,
      documentRetriever: appComponents.documentRetriever,
      scriptInjector: appComponents.scriptInjector
    }),
    putAnnotation: annotationRoutes.putAnnotation({
      annotationValidator: appComponents.annotationValidator,
      annotationStore: appComponents.annotationStore,
      annotationLinkBuilder: appComponents.annotationLinkBuilder
    })
  }
}
