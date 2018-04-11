import { normalizeUrlForLinkGeneration } from "../utils/urls";

export class AnnotationLinkBuilder {
  private _baseUrl : string

  constructor({baseUrl} : {baseUrl : string}) {
    this._baseUrl = baseUrl
  }

  buildAnnotationLink({id, url}) {
    return `${this._baseUrl}/${id}/${normalizeUrlForLinkGeneration(url)}`
  }
}
