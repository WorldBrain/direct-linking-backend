import { expect } from 'chai';
import { HtmlMetadataExtractor } from './metadata-extractor'
import { RetrievedDocument } from './document-retriever';

describe('HtmlMetadataExtractor', () => {
    it('should correctly extract all metadata of a valid document', async () => {
        const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Page title</title>
            <meta name="title" content="Meta title">
            <meta name="description" content="Meta description">
            <meta name="og:title" content="Graph title">
            <meta name="og:description" content="Graph description">
            <meta name="og:image" content="https://social/image.png">
        </head>
        <body>
        </body>
        <html>
        `
        const extractor = new HtmlMetadataExtractor()
        const retrievedDocument : RetrievedDocument = {
            url: 'https://test.com',
            mime: 'text/html',
            content
        }
        expect(await extractor.extractPageMetadata(retrievedDocument)).to.deep.equal({
            title: "Graph title",
            description: "Graph description",
            externalImageUrls: {
                social: "Graph title",
            },
        })
    })
})