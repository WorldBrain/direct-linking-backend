import { Annotation } from '../types/annotations';
import { PageMetadata } from '../types/metadata';

export class AnnotationSkeletonGenerator {
    generateSkeleton({annotation, metadata} : {annotation : Annotation, metadata : PageMetadata}) : string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title></title>
            ${metadata.title ? `<meta name="og:title" content="${metadata.title}">` : ''}
            ${metadata.description ? `<meta name="og:description" content="${metadata.description}">` : ''}
            ${metadata.externalImageUrls && metadata.externalImageUrls.social ?
              `<meta name="og:image" content="${metadata.externalImageUrls.social}">` : ''}
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
