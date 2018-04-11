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
  retrieveDocumentImage({document} : {document : RetrievedDocument}) : Promise<RetrievedDocumentImage>
}


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

  async retrieveDocumentImage({document}) {
    const content = new Buffer('')
    this.single.image.content.copy(content)
    return {...this.single.image, content}
  }
}
