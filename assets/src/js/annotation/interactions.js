import { getState, getResource, modifyState } from '../state'
import { copyToClipboard } from '../utils'
import { goToDemo } from '../router'
import { isDesktop, isEmbeddingDisabledOnDeviceSize } from './utils'
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
        window.location.href = annotation.url
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
        const listId = parseInt(e.target.dataset.listId, 10)
        if(isNaN(listId)) return

        modifyState('activeLi', listId)
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
    if (!isDesktop(getState('deviceSizeName')))
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

            if ($feature.style.maxHeight)
                $feature.style.maxHeight = null
            else
                $feature.style.maxHeight = '400px'

            const listId = parseInt(this.dataset.listId, 10)
            modifyState('activeLi', listId)
            setTimeout(() => {
                lazyLoadFeatureImage()
            }, 200);
        })
    })
}