import { getState, getResource, modifyState } from '../state'
import { copyToClipboard } from '../utils'
import { goToDemo } from '../router'
import { isEmbeddingDisabledOnDeviceSize } from './utils'
import { lazyLoadFeatureImage } from './rendering'

export function attachCopyAndGoListener() {
    document.querySelector('.copy-button').addEventListener('click', event => {
        event.preventDefault()
        copyQuoteAndMaybeGoToPage()
    })
}

function copyQuoteAndMaybeGoToPage() {
    const forceDisableEmbedding = isEmbeddingDisabledOnDeviceSize(getState('deviceSizeName'))
    const annotation = getResource('annotation')
    copyToClipboard(annotation.anchors[0].quote)
    document.querySelector('.copy-button').classList.add('copied')
    if (!getResource('metadata').embeddable || forceDisableEmbedding) {
        document.querySelector('.search-text').classList.remove('only-embeddable')
        setTimeout(() => window.location.href = annotation.url, 3000)
    }
}

export function setupToggleTrunctation() {
    document.querySelector('.enable-truncation').addEventListener('click', () => {
        document.querySelector('.quote').classList.remove('show-more')
    })
    document.querySelector('.disable-truncation').addEventListener('click', () => {
        document.querySelector('.quote').classList.add('show-more')
    })
}


export function setupLiveDemoButton() {
    document.querySelector('.btn-live-demo').addEventListener('click', () => {
        goToDemo()
    })
}

export function setupFeaturesList() {
    document.querySelector('.features-list').addEventListener('click', (e) => {
        e.preventDefault()
        const featureId = parseInt(e.target.dataset.featureId, 10)
        if(isNaN(featureId)) return

        modifyState('activeFeature', featureId)
        lazyLoadFeatureImage()

        // If the page hasn't been scrolled, scroll to feature images
        const $header = document.querySelector('.about-memex-header')
        if (window.pageYOffset <= 100)
            window.scrollTo({
                top: $header.offsetTop,
                behavior: 'smooth'
            })
    })
}

export function setupLazyLoad() {
    if (getState('deviceSizeName') === 'mobile')
        return

    document.addEventListener('scroll', (e) => {
        setTimeout(() => {
            lazyLoadFeatureImage()            
        }, 150);
    })
}

export function setupAccordions() {
    [].forEach.call(document.querySelectorAll('.feature-accordion'), ($accordion) => {
        $accordion.addEventListener('click', function(){
            const $iconContainer = this.lastElementChild
            const $icon = $iconContainer.firstElementChild
            const $feature = this.nextElementSibling

            $icon.classList.toggle('up')
            window.dobe = $feature
            if ($feature.style.maxHeight)
                $feature.style.maxHeight = null
            else
                $feature.style.maxHeight = '600px'

            const featureId = parseInt(this.dataset.featureId, 10)
            modifyState('activeFeature', featureId)

            setTimeout(() => {
                lazyLoadFeatureImage()
            }, 200);
        })
    })
}