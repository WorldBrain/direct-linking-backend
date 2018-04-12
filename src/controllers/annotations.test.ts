import { expect } from 'chai'
import { createDummyAnnotationValidator } from '../components/annotation-validator'
import { AnnotationLinkBuilder } from '../components/annotation-link-builder'
import { SingleDocumentRetriever } from '../components/document-retriever'
import { DummyMetadataExtractor } from '../components/metadata-extractor'
import { MemoryStorage } from '../components/storage'
import { Annotation } from '../types/annotations'
import * as controllers from './annotation'

describe('Annotation upload controller integration test', () => {
    it('should work under expected conditions', async () => {
        const inputUrl = 'https://bla.com/article/?test=foo#wefef'
        const retrievalUrl = 'https://bla.com/article/?test=foo'

        const storage = new MemoryStorage()
        const dummyDocument = {
            content: '<strong>Test!</strong>',
            mime: 'text/html',
            url: inputUrl
        }
        const dummyImage = {
            content: new Buffer('dwqedweqd'),
            mime: 'image/png'
        }
        const dummyMetadata = {
            title: 'The Title',
            description: 'The Description',
            imageURL: 'https://bla.com/article/image.png'
        }
        const controller = controllers.putAnnotation({
            annotationValidator: createDummyAnnotationValidator({isAlwaysValid: true}),
            annotationLinkBuilder: new AnnotationLinkBuilder({baseUrl: 'https://memex.link'}),
            storage: storage,
            documentRetriever: new SingleDocumentRetriever({
                url: retrievalUrl,
                document: dummyDocument,
                images: {logo: dummyImage}
            }),
            metadataExtractor: new DummyMetadataExtractor({expectedUrl: inputUrl, metdata: dummyMetadata})
        })

        const anchors = [{range: 'something'}];
        const result = await controller({unvalidatedAnnotation: <Annotation>{
            url: inputUrl,
            anchors
        }})
        expect(result.link).to.equal(`https://memex.link/${result.id}/bla.com/article`)

        expect(Object.keys(storage.annotations).length).to.equal(1)
        expect(await storage.getAnnotationById(result.id)).to.deep.equal({
            id: result.id,
            url: inputUrl,
            storageUrl: 'bla.com/article',
            anchors
        })
        
        expect(Object.keys(storage.metadata).length).to.equal(1)
        expect(await storage.getStoredMetadataForUrl(result.storageUrl)).to.deep.equal(dummyMetadata)
        
        expect(Object.keys(storage.documents).length).to.equal(1)
        expect(await storage.getCachedDocument(result.storageUrl)).to.deep.equal(dummyDocument)
    })
})
