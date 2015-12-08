import LineTopIndex from '../../src/line-top-index'
import Node from '../../src/node'
import {ZERO_POSITION, add as addLogicalPositions, format as formatLogicalPosition} from '../../src/logical-position-helpers'

LineTopIndex.prototype.toHTML = function () {
  if (this.root) {
    return this.root.toHTML()
  } else {
    return ''
  }
}

Node.prototype.toHTML = function (leftAncestorPosition = ZERO_POSITION) {
  let s = '<style>'
  s += 'table { width: 100%; }'
  s += 'td { width: 50%; text-align: center; border: 1px solid gray; white-space: nowrap; }'
  s += '</style>'

  s += '<table>'

  s += '<tr>'
  let position = addLogicalPositions(leftAncestorPosition, this.distanceFromLeftAncestor)
  s += '<td colspan="2">' + formatLogicalPosition(position) + '/ [' +  this.id + '] </td>'
  s += '</tr>'

  if (this.left || this.right) {
    s += '<tr>'
    s += '<td>'
    if (this.left) {
      s += this.left.toHTML(leftAncestorPosition)
    } else {
      s += '&nbsp;'
    }
    s += '</td>'
    s += '<td>'
    if (this.right) {
      s += this.right.toHTML(position)
    } else {
      s += '&nbsp;'
    }
    s += '</td>'
    s += '</tr>'
  }

  s += '</table>'

  return s
}
