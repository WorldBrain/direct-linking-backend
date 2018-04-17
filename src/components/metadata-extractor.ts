const _ = require('lodash')
import * as HtmlParser from 'fast-html-parser'
import { PageMetadata } from '../types/metadata'
import { RetrievedDocument } from './document-retriever'

export interface MetadataExtractor {
    extractPageMetadata(document : RetrievedDocument) : Promise<PageMetadata>
}

//
// For unit tests: always returns the same meta data, only for one given URL
//

export class DummyMetadata {
    expectedUrl : string
    metdata : PageMetadata
}

export class DummyMetadataExtractor implements MetadataExtractor {
    constructor(private dummy : DummyMetadata) {
    }

    async extractPageMetadata(document : RetrievedDocument) {
        if (document.url !== this.dummy.expectedUrl) {
            return null
        }

        return this.dummy.metdata
    }
}

//
// HTML metadata extractor
//

export class HtmlMetadataExtractor implements MetadataExtractor {
    async extractPageMetadata(document : RetrievedDocument) {
        const doc : Document = HtmlParser.parse(document.content)
        const metadata : PageMetadata = {
            title: _extractTitleFromDom(doc),
            description: _extractDescriptionFromDom(doc),
            externalImageUrls: {social: _extractSocialPreviewImageUrlFromDom(doc)},
            embeddable: document.embeddable,
        }
        return metadata
    }
}

export function _extractTitleFromDom(doc : Document) : string | null {
    return _extractMetatagValueFromDom(doc, 'og:title') || _extractValueFromDom(doc, 'title', false, node => node.text)
}

export function _extractDescriptionFromDom(doc : Document) : string | null {
    return _extractMetatagValueFromDom(doc, 'og:description') || _extractMetatagValueFromDom(doc, 'description')
}

export function _extractSocialPreviewImageUrlFromDom(doc : Document) : string | null {
    return _extractMetatagValueFromDom(doc, 'og:image')
}

export function _extractMetatagValueFromDom(doc : Document, type : string) : string | null {
    return _extractValueFromDom(
        doc, `meta`, node => node.attributes['name'] === type,
        node => node.attributes['content']
    )
}

export function _extractValueFromDom(doc : Document, selector : string, filter : boolean | ((node) => boolean), extractor : (node) => string) {
    let nodes = filter ? doc.querySelectorAll(selector) : [doc.querySelector(selector)].filter(_.identity)
    if (!nodes.length) {
        return null
    }
    if (filter) {
        nodes = _.filter(nodes, filter)
    }
    if (!nodes.length) {
        return null
    }
    return extractor(nodes[0])
}
