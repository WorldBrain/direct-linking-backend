import { Annotation } from '../types/annotations';
import { PageMetadata } from '../types/metadata';

export interface AnnotationSkeletonGeneratorProps {
    annotation : Annotation
    metadata : PageMetadata
}

export class AnnotationSkeletonGenerator {
    generateSkeleton(props : AnnotationSkeletonGeneratorProps) : string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title></title>
            ${_generateMetaTags(props)}
            <link rel=stylesheet href="/assets/styles.css">
            <script src="/assets/script.js"></script>
        </head>
        <body class='loading'>
        <div class='loading-indicator'>
            <div class='loading-indicator-1'></div>
            <div class='loading-indicator-2'></div>
            <div class='loading-indicator-3'></div>
            <div class='loading-indicator-4'></div>
        </div>
        </body>
        </html>
        `
    }
}

export function _generateMetaTags(
    {annotation, metadata} : AnnotationSkeletonGeneratorProps
) {
    // OG protocol cannot create graph objects without these atts
    if (
        !metadata.title ||
        !metadata.externalImageUrls ||
        !metadata.externalImageUrls.social
    ) {
        return ''
    }

    return `
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
        <meta name="twitter:card" content="summary" />
        <meta property="og:type" content="website" />
        <meta property="og:url" of="${_escapeForeignHtmlString(annotation.url)}" />
        <meta property="og:title" content="${_escapeForeignHtmlString(metadata.title)}" />
        <meta property="og:image" content="${_escapeForeignHtmlString(metadata.externalImageUrls.social)}" />
        ${metadata.description
            ? `<meta property="og:description" content="${_escapeForeignHtmlString(metadata.description)}" />`
            : ''}
    `
}

export function _escapeForeignHtmlString(input : string) : string {
    return input.replace('<', '&lt;').replace('>', '&gt;')
}
