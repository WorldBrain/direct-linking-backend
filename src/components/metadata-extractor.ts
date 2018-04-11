import { PageMetadata } from '../types/metadata'
import { RetrievedDocument } from './document-retriever'

export interface MetadataExtractor {
    extractPageMetadata(document : RetrievedDocument) : Promise<PageMetadata>
}

export class DummyMetadata {
    expectedUrl : string
    metdata : PageMetadata
}

export class DummyMetadataExtractor {
    constructor(private dummy : DummyMetadata) {
    }

    async extractPageMetadata(document : RetrievedDocument) {
        if (document.url !== this.dummy.expectedUrl) {
            return null
        }

        return this.dummy.metdata
    }
}
