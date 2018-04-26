import { getResource } from '../state'

export function renderTemplate() {
    document.querySelector('body').innerHTML = getResource('demoTemplate')
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
