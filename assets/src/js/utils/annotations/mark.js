import highlightRange from 'dom-highlight-range';

export default function markRange({range, cssClass}) {
  highlightRange(range, cssClass)
}
