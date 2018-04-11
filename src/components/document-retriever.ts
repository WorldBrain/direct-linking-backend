import * as request from 'request-promise-native'
import { PageMetadata } from '../types/metadata';

export interface RetrievedDocument {
  content : string
  mime : string
  url : string
}

export interface RetrievedDocumentImage {
  content : Buffer
  mime : string
}

export interface DocumentRetriever {
  retrieveDocument({url} : {url : string}) : Promise<RetrievedDocument>
  retrieveDocumentImage({metadata} : {metadata : PageMetadata}) : Promise<RetrievedDocumentImage>
}

//
// Single document retriever for unit testing, returns a predifined document at a prefined URL
//

export interface SingleDocument {
  url : string
  document : RetrievedDocument
  image : RetrievedDocumentImage
}

export class SingleDocumentRetrievalError extends Error {}

export class SingleDocumentRetriever implements DocumentRetriever {
  constructor(private single : SingleDocument) {

  }

  async retrieveDocument({url} : {url : string}) {
    if (url !== this.single.url) {
      throw new SingleDocumentRetrievalError(url)
    }

    return {...this.single.document}
  }

  async retrieveDocumentImage({metadata}) {
    const content = new Buffer('')
    this.single.image.content.copy(content)
    return {...this.single.image, content}
  }
}

// Actual implementation of DocumentRetriever

export class HttpDocumentRetriever implements DocumentRetriever {
  async retrieveDocument({url}) {
    const response = await request({
      uri: url,
      resolveWithFullResponse: true
    })
    return {url, content: response.body, mime: response.headers['content-type'].split(';')[0]}
  }

  async retrieveDocumentImage({metadata}) {
    const response = await request({
      uri: metadata.imageUrl,
      resolveWithFullResponse: true,
      encoding: null
    })
    return {
      content: new Buffer(response.body),
      mime: response.headers['content-type'].split(';')[0]
    }
  }
}
