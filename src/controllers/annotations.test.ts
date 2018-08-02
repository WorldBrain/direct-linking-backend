import { expect } from 'chai'
import { createDummyAnnotationValidator } from '../components/annotation-validator'
import { AnnotationLinkBuilder } from '../components/annotation-link-builder'
import { AnnotationSkeletonGenerator } from '../components/annotation-skeleton-generator'
import { SingleDocumentRetriever } from '../components/document-retriever'
import { DummyMetadataExtractor } from '../components/metadata-extractor'
import { Storage, MemoryStorage, AwsStorage } from '../components/storage'
import { Annotation } from '../types/annotations'
import { shouldUseAws, shouldUseAwsForTests, getUnitTestAwsBucket } from '../options'
import * as controllers from './annotations'

describe('Annotation upload controller integration test', () => {
    function testSuite({storage} : {storage : Storage}) {
        it('should work under expected conditions', async () => {
            const inputUrl = 'https://bla.com/article/?test=foo#wefef'
            const retrievalUrl = 'https://bla.com/article/?test=foo'

            const dummyDocument = {
                content: '<strong>Test!</strong>',
                mime: 'text/html',
                url: inputUrl,
                embeddable: false,
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
                annotationSkeletonGenerator: new AnnotationSkeletonGenerator(),
                storage,
                documentRetriever: new SingleDocumentRetriever({
                    url: retrievalUrl,
                    document: dummyDocument,
                    images: {logo: dummyImage},
                }),
                metadataExtractor: new DummyMetadataExtractor({expectedUrl: inputUrl, metdata: dummyMetadata}),
                analytics: {trackEvent: async () => {}}
            })

            const anchors = [{range: 'something'}]
            const result = await controller({unvalidatedAnnotation: <Annotation>{
                url: inputUrl,
                anchors
            }})
            expect(result.link).to.equal(`https://memex.link/${result.id}/bla.com/article`)

            const storedAnnotation = await storage.getAnnotationById(result.id);
            expect(storedAnnotation).to.deep.equal({
                id: result.id,
                url: inputUrl,
                storageUrl: 'bla.com/article',
                anchors
            })
            expect(await storage.getStoredMetadataForUrl(result.storageUrl)).to.deep.equal(dummyMetadata)
            expect(await storage.getCachedDocument(result.storageUrl)).to.deep.equal(dummyDocument)
            expect(await storage.getStoredAnnotationSkeleton({annotation: storedAnnotation})).to.contain('html')
        })
    }

    describe('Memory storage', () => {
        testSuite({storage: new MemoryStorage()})
    })
    
    if (shouldUseAwsForTests()) {
        describe.only('AWS storage', function() {
            this.timeout(10 * 1000)
            const bucketName = getUnitTestAwsBucket()
            const storage = new AwsStorage({ bucketName });
            testSuite({storage: storage})

            after(async () => {
                if (bucketName.indexOf('unittest') === -1) {
                    return
                }

                // TODO: Empty bucket, or maybe delete newly created bucket
                // Not urgent, there's an automatic expire of one day
            })
        })
    }
})
