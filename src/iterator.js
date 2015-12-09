import Node from './node'
import {ZERO_POSITION, add as addLogicalPositions} from './logical-position-helpers'

export default class Iterator {
  constructor (tree) {
    this.tree = tree
  }

  reset () {
    this.leftAncestor = null
    this.leftAncestorPosition = ZERO_POSITION
    this.leftAncestorStack = [null]
    this.leftAncestorPositionStack = [ZERO_POSITION]
    this.currentPosition = ZERO_POSITION
    this.setCurrentNode(this.tree.root)
  }

  insertBlockEnd (row) {
    this.reset()

    if (!this.currentNode) {
      this.tree.root = new Node(null, {rows: row, pixels: 0})
      return this.tree.root
    }

    while (true) {
      if (row < this.currentPosition.rows) {
        if (this.currentNode.left) {
          this.descendLeft()
        } else {
          return this.insertLeftChild(row)
        }
      } else if (row === this.currentPosition.rows) {
        return this.currentNode
      } else { // row > this.currentPosition.rows
        if (this.currentNode.right) {
          this.descendRight()
        } else {
          return this.insertRightChild(row)
        }
      }
    }
  }

  totalBlockPixelsPrecedingRow (row) {
    this.reset()

    if (!this.currentNode) return 0

    while (true) {
      if (row < this.currentPosition.rows) {
        if (this.currentNode.left) {
          this.descendLeft()
        } else {
          return this.leftAncestorPosition.pixels
        }
      } else if (row === this.currentPosition.rows) {
        return this.currentPosition.pixels
      } else { // row > this.currentPosition.rows
        if (this.currentNode.right) {
          this.descendRight()
        } else {
          return this.currentPosition.pixels
        }
      }
    }
  }

  rowForPixelPosition (pixelPosition, lineHeight) {
    this.reset()

    if (!this.currentNode) return Math.floor(pixelPosition / lineHeight)

    let blockStart, blockEnd
    while (true) {
      blockEnd = (this.currentPosition.rows * lineHeight) + this.currentPosition.pixels
      blockStart = blockEnd - this.currentNode.blockHeight

      if (blockStart <= pixelPosition && pixelPosition <= blockEnd) {
        return this.currentPosition.rows
      } else if (pixelPosition < blockStart) {
        if (this.currentNode.left) {
          this.descendLeft()
        } else {
          let previousBlockEnd = (this.leftAncestorPosition.rows * lineHeight) + this.leftAncestorPosition.pixels
          let overshoot = pixelPosition - previousBlockEnd
          return this.leftAncestorPosition.rows + Math.floor(overshoot / lineHeight)
        }
      } else { // pixelPosition > blockEnd
        if (this.currentNode.right) {
          this.descendRight()
        } else {
          let overshoot = pixelPosition - blockEnd
          return this.currentPosition.rows + Math.floor(overshoot / lineHeight)
        }
      }
    }
  }

  setCurrentNode (node) {
    this.currentNode = node
    if (this.currentNode) {
      this.currentPosition = addLogicalPositions(this.leftAncestorPosition, this.currentNode.distanceFromLeftAncestor)
    }
  }

  descendLeft () {
    this.pushToAncestorStacks()
    this.setCurrentNode(this.currentNode.left)
  }

  descendRight () {
    this.pushToAncestorStacks()
    this.leftAncestor = this.currentNode
    this.leftAncestorPosition = this.currentPosition
    this.setCurrentNode(this.currentNode.right)
  }

  pushToAncestorStacks () {
    this.leftAncestorStack.push(this.leftAncestor)
    this.leftAncestorPositionStack.push(this.leftAncestorPosition)
  }

  insertLeftChild (row) {
    let extent = {
      rows: row - this.leftAncestorPosition.rows,
      pixels: 0
    }
    let newNode = new Node(this.currentNode, extent)
    this.currentNode.left = newNode
    return newNode
  }

  insertRightChild (row) {
    let extent = {
      rows: row - this.currentPosition.rows,
      pixels: 0
    }
    let newNode = new Node(this.currentNode, extent)
    this.currentNode.right = newNode
    return newNode
  }
}
