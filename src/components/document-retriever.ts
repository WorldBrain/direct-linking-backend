// const _ = require('lodash')
import * as request from 'request-promise-native'
import * as fakeUa from 'fake-useragent'
import { PageMetadata } from '../types/metadata'
import { asyncMapValues } from '../utils/async'

export interface RetrievedDocument {
  content : string
  mime : string
  url : string
  embeddable : boolean
}

export interface RetrievedDocumentImage {
  content : Buffer
  mime : string
}

export abstract class DocumentRetriever {
  abstract retrieveDocument({url} : {url : string}) : Promise<RetrievedDocument>
  abstract retrieveDocumentImage({metadata, type} : {metadata : PageMetadata, type : string}) : Promise<RetrievedDocumentImage>

  async retrieveDocumentImages({metadata} : {metadata : PageMetadata}) : Promise<{[type : string]: RetrievedDocumentImage}> {
    return await asyncMapValues(metadata.imageUrls, (imageUrl, type) => this.retrieveDocumentImage({metadata, type}))
  }
}

//
// Single document retriever for unit testing, returns a predifined document at a prefined URL
//

export interface SingleDocument {
  url : string
  document : RetrievedDocument
  images : {[type : string]: RetrievedDocumentImage}
}

export class SingleDocumentRetrievalError extends Error {}

export class SingleDocumentRetriever extends DocumentRetriever {
  constructor(private single : SingleDocument) {
    super()
  }

  async retrieveDocument({url} : {url : string}) {
    if (url !== this.single.url) {
      throw new SingleDocumentRetrievalError(url)
    }

    return {...this.single.document}
  }

  async retrieveDocumentImage({metadata, type}) {
    const content = new Buffer('')
    this.single.images[type].content.copy(content)
    return {...this.single.images[type], content}
  }
}

// Actual implementation of DocumentRetriever

export class HttpDocumentRetriever extends DocumentRetriever {
  async retrieveDocument({url}) {
    // THROWS: RequestError: Error: ESOCKETTIMEDOUT

    const response = await request({
      uri: url,
      resolveWithFullResponse: true,
      timeout: 3 * 1000,
      headers: {
        'User-Agent': fakeUa()
      }
    })
    const mime = response.headers['content-type'].split(';')[0]
    const embeddable = _deduceEmbeddableFromHeaders(response.headers)
    return {url, content: response.body, mime, embeddable}
  }

  async retrieveDocumentImage({metadata, type}) {
    // THROWS: RequestError: Error: ESOCKETTIMEDOUT
    
    const response = await request({
      uri: metadata.imageUrls[type],
      resolveWithFullResponse: true,
      encoding: null,
      timeout: 3 * 1000
    })
    return {
      content: new Buffer(response.body),
      mime: response.headers['content-type'].split(';')[0]
    }
  }
}

export function _deduceEmbeddableFromHeaders(headers : {[key : string] : string}) : boolean {
  return (
    (headers['x-frame-options'] || '').length === 0 &&
    (headers['content-security-policy'] || '').indexOf('frame-ancestors') === -1
  )
}
