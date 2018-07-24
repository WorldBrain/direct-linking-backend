import { Annotation } from '../types/annotations'
import { Storage } from '../components/storage/types'
import { AnnotationValidator } from '../components/annotation-validator'
import { AnnotationLinkBuilder } from '../components/annotation-link-builder'
import { DocumentRetriever } from '../components/document-retriever'
// import { compareUrlsQuickAndDirty } from '../utils/urls'
import { MetadataExtractor } from '../components/metadata-extractor';
import { normalizeUrlForStorage, normalizeUrlForRetrieval } from '../utils/urls'
import { AnnotationSkeletonGenerator } from '../components/annotation-skeleton-generator'
import { trackEvent } from '../../assets/src/js/annotation/backend'

// export function retrieveAnnotation(
//     {storage, documentRetriever} :
//     {storage : Storage, documentRetriever : DocumentRetriever}
//   ) {
//     return async function handleAnnotationGetRequest({id, urlWithoutProtocolFromRequest}) {
//       const annotation = await storage.getAnnotationById(id)
//       const metdata = await storage.getStoredMetadataForUrl(annotation.url)
//       const image = await storage.getCachedImageLocationForUrl(annotation.url)
  
//       const urlFromAnnotation = annotation.url
//       const urlGivenAndStoredMatch = compareUrlsQuickAndDirty(urlWithoutProtocolFromRequest, urlFromAnnotation)
//       if (!urlGivenAndStoredMatch) {
//         // TODO: What do we do here?
//       }
  
//       return {content: document.content}
//     }
//   }
  
  export function putAnnotation(
    {annotationValidator, annotationLinkBuilder, annotationSkeletonGenerator, storage, documentRetriever, metadataExtractor} :
    {annotationValidator : AnnotationValidator, annotationLinkBuilder : AnnotationLinkBuilder
     annotationSkeletonGenerator : AnnotationSkeletonGenerator,
     storage : Storage, documentRetriever : DocumentRetriever, metadataExtractor : MetadataExtractor}
  ) {
    return async function handleAnnotationPutRequest({unvalidatedAnnotation}) {
      const annotation = await annotationValidator(unvalidatedAnnotation)
      if (!annotation) {
        // TODO: What to do here?
      }

      const storageUrl = normalizeUrlForStorage(annotation.url)
      const document = await documentRetriever.retrieveDocument({url: normalizeUrlForRetrieval(annotation.url)})
      const metadata = await metadataExtractor.extractPageMetadata(document)
      const images = await documentRetriever.retrieveDocumentImages({metadata})
      await Promise.all([
        storage.storeMetadata({url: storageUrl, metadata}),
        storage.storeDocument({url: storageUrl, document}),
        storage.storeDocumentImages({url: storageUrl, images})
      ])
      
      // Only store annotation after everything else has been stored successfuly
      // TODO: Since the image costs the most data, maybe we should store the image last?
      const {id} = await storage.storeAnnotation({annotation})
      const skeleton = annotationSkeletonGenerator.generateSkeleton({annotation, metadata})
      await storage.storeAnnotationSkeleton({annotation, skeleton})

      await trackEvent({id, type: 'create-memex-link'})
      const link = await annotationLinkBuilder.buildAnnotationLink({id, url: annotation.url})
      return {link, id, storageUrl}
    }
  }
  