export interface ImageMap {
    [type : string] : string
}

export interface PageMetadata {
    title? : string
    description? : string
    imageUrls? : ImageMap
    externalImageUrls? : ImageMap
    cachedImageUrls? : ImageMap
}
