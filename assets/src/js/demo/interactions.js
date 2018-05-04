import * as dom from '@annotator/dom'
import { modifyState, getState } from '../state'
import { selectionToDescriptor } from '../utils/annotations'
import { requestCreateLinkToClipboard, resetLinkState } from './actions'

export function setupSelectionHandler() {
    document.querySelector('.area.middle').addEventListener('mouseup', event => {
        if (!getState('tooltip.active')) {
            updateTooltipPosition({x: event.pageX, y: event.pageY})
            activateToolTipIfNeeded()
        }
    })

    const $tooltipContainer = document.querySelector('.tooltip-container')
    $tooltipContainer.addEventListener('click', event => {
        const directClick = event.target === $tooltipContainer
        if (directClick) {
            modifyState('tooltip.active', false)
            resetLinkState()
        }
    })
}

export function setupCreationLink() {
    document.querySelector('.create-link-button').addEventListener('mousedown', async (event) => {
        requestCreateLinkToClipboard({anchor: await extractAnchor()})
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
    const selection = document.getSelection()
    return {
        quote: selection.toString(),
        descriptor: await selectionToDescriptor({
            selection,
            corpus: selection.baseNode
        })
    }
}
