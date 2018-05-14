import { getResource, getState } from '../state'
import { descriptorToRange, markRange } from '../utils/annotations'

export function updateBodyClasses() {
    const hasAnnotation = !!getResource('demoAnnotation') ? 'demo-with-annotation' : 'demo-without-annotation'
    document.body.classList.add(hasAnnotation)
}

export function renderTemplate() {
    document.body.innerHTML = getResource('demoTemplate')
    const $tooltipContainenr = document.querySelector('.tooltip-container')
    const textHeight = document.querySelector('.area.middle').clientHeight
    $tooltipContainenr.style.height = `${textHeight}px`
}

export function renderTooltip({active, position}) {
    setTooltipVisible(active)
    if (active) {
        setTooltipPosition(position)
    }
}

export function renderLinkCreationProgress({oldProgress, newProgress}) {
    const $tooltip = document.querySelector('.tooltip')
    const cssClasses = {
        'pristine': 'state-initial',
        'running': 'state-creating-link',
        'done': 'state-created-link',
        'error': 'state-link-error',
        'copied': 'state-link-copied',
    }

    if (oldProgress) {
        $tooltip.classList.remove(cssClasses[oldProgress])
    }
    $tooltip.classList.add(cssClasses[newProgress])
}

export function renderLinkUrl(url) {
    const $url = document.querySelector('.tooltip .url')
    $url.setAttribute('href', url)
    $url.innerHTML = url
}

export function positionInitialSelectionHelper() {
    positionHelper({
        $anchor: document.querySelector('.initial-selection'),
        $helper: document.querySelector('.initial-selection-helper')
    })
}

export function positionHighlightHelper() {
    positionHelper({
        $anchor: document.querySelector('.highlight'),
        $helper: document.querySelector('.highlight-helper')
    })
}

function positionHelper({$anchor, $helper}) {
    $helper.style.marginTop = `${$anchor.offsetTop}px`
}

export async function highlightAnnotation({annotation}) {
    const descriptor = annotation.anchors[0].descriptor
    const range = await descriptorToRange({descriptor})
    markRange({range, cssClass: 'highlight'})
}

export function setTooltipVisible(value) {
    const $tooltipContainer = document.querySelector('.tooltip-container')
    
    if (!value) {
        $tooltipContainer.classList.remove('active')
    } else {
        $tooltipContainer.classList.add('active')
    }
}

export function setTooltipPosition({x, y}) {
    const $tooltip = document.querySelector('.tooltip')
    $tooltip.style.left = `${x}px`
    $tooltip.style.top = `${y}px`
}
