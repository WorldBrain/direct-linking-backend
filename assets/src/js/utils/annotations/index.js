import * as fragment from '@annotator/fragment-identifier'
import { describeTextQuoteByRange as describeRange } from '@annotator/dom'
import { search } from './search.js'

export function isSelectionWithinCorpus({selection, corpus}) {
    if (selection === null || selection.isCollapsed) {
        return false
    }

    const range = selection.getRangeAt(0)
    return isWithinNode(range, corpus)
}

export async function selectionToDescriptor({selection, corpus}) {
    if (selection === null || selection.isCollapsed) {
        return null
    }
    const range = selection.getRangeAt(0)
    const selectableRange = document.createRange()
    selectableRange.selectNodeContents(corpus)
    const descriptor = await describeRange({ range, context: selectableRange })
    return descriptor
}

export async function descriptorToRange({corpus, descriptor}) {
    const results = search(corpus, descriptor)
    const ranges = []
    for await (let range of results) {
        ranges.push(range)
    }
    return ranges.length ? ranges[0] : null
}

function isWithinNode(range, node) {
  const nodeRange = document.createRange()
  nodeRange.selectNode(node)

  return (
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) >= 0 &&
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) <= 0
  )
}
