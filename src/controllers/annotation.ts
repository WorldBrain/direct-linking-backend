import { Annotation } from '../types/annotations'
import { Storage } from '../components/storage'
import { AnnotationValidator } from '../components/annotation-validator'
import { AnnotationLinkBuilder } from '../components/annotation-link-builder'
import { DocumentRetriever } from '../components/document-retriever'
// import { compareUrlsQuickAndDirty } from '../utils/urls'
import { MetadataExtractor } from '../components/metadata-extractor';
import { normalizeUrlForStorage, normalizeUrlForRetrieval } from '../utils/urls'

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
    {annotationValidator, annotationLinkBuilder, storage, documentRetriever, metadataExtractor} :
    {annotationValidator : AnnotationValidator, annotationLinkBuilder : AnnotationLinkBuilder,
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
      const image = await documentRetriever.retrieveDocumentImage({metadata})
      await Promise.all([
        storage.storeMetadata({url: storageUrl, metadata}),
        storage.storeDocument({url: storageUrl, document}),
        storage.storeDocumentImage({url: storageUrl, image})
      ])
      
      // Only store annotation after everything else has been stored successfuly
      // TODO: Since the image costs the most data, maybe we should store the image last?
      const {id} = await storage.storeAnnotation({annotation})
      const link = await annotationLinkBuilder.buildAnnotationLink({id, url: annotation.url})
      return {link, id, storageUrl}
    }
  }
  