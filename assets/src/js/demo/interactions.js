import * as dom from '@annotator/dom'
import { modifyState, getState } from '../state'
import { selectionToDescriptor } from '../utils/annotations'
import { requestCreateLinkToClipboard } from './actions'

export function setupSelectionHandler() {
    document.querySelector('.area.middle').addEventListener('mouseup', event => {
        if (!getState('tooltip.active')) {
            updateTooltipPosition({x: event.clientX, y: event.clientY})
            activateToolTipIfNeeded()
        }
    })

    const $tooltipContainer = document.querySelector('.tooltip-container')
    $tooltipContainer.addEventListener('click', event => {
        const directClick = event.target === $tooltipContainer
        if (directClick) {
            modifyState('tooltip.active', false)
        }
    })
}

export function setupCreationLink() {
    document.querySelector('.create-link-button').addEventListener('mousedown', async () => {
        console.log(await extractAnchor())
        // requestCreateLinkToClipboard()
    })
}

function updateTooltipPosition({x, y}) {
    modifyState('tooltip.position', {x, y})
}

function activateToolTipIfNeeded() {
    const selection = document.getSelection()
    const userSelectedText = !!selection && !selection.isCollapsed
    if (userSelectedText) {
        modifyState('tooltip.active', true)
    }
}

async function extractAnchor() {
    return {descriptor: await selectionToDescriptor({
        selection: document.getSelection(),
        corpus: document.querySelector('.area.middle')
    })}
}
