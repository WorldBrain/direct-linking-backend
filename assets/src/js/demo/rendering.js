import { getResource, getState } from '../state'
import { descriptorToRange } from '../utils/annotations'
import markRange from '../utils/annotations/mark'

export function updateBodyClasses() {
    const hasAnnotation = !!getResource('demoAnnotation') ? 'demo-with-annotation' : 'demo-without-annotation'
    document.body.classList.add(hasAnnotation)
}

export function renderTemplate() {
    document.body.innerHTML = getResource('demoTemplate')
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
    }

    if (oldProgress) {
        $tooltip.classList.remove(cssClasses[oldProgress])
    }
    $tooltip.classList.add(cssClasses[newProgress])
}

export function renderLinkUrl(url) {
    document.querySelector('.tooltip .url').setAttribute('href', url)
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
    const range = await descriptorToRange({corpus: document, descriptor: descriptor})
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
