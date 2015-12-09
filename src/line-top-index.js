import Random from 'random-seed'
import Iterator from './iterator'
import {add as addLogicalPositions, subtract as subtractLogicalPositions} from './logical-position-helpers'

export default class LineTopIndex {
  constructor (params = {}) {
    this.maxRow = params.maxRow || 0
    this.defaultLineHeight = params.defaultLineHeight || 0
    this.randomGenerator = new Random(params.seed || Date.now())
    this.root = null
    this.iterator = this.buildIterator()
  }

  buildIterator () {
    return new Iterator(this)
  }

  insertBlock (row, height) {
    let node = this.iterator.insertBlockEnd(row)
    if (node.priority == null) {
      node.priority = this.generateRandom()
      this.bubbleNodeUp(node)
    }

    node.distanceFromLeftAncestor.pixels += height
    node.blockHeight += height
    while (node.parent) {
      if (node.parent.left === node) {
        node.parent.distanceFromLeftAncestor.pixels += height
      }
      node = node.parent
    }
  }

  pixelPositionForRow (row) {
    return (row * this.defaultLineHeight) + this.iterator.totalBlockPixelsPrecedingRow(row)
  }

  rowForPixelPosition (pixelPosition) {
    return this.iterator.rowForPixelPosition(pixelPosition, this.defaultLineHeight)
  }

  splice (outputStart, replacedExtent, replacementExtent, options) {
    let outputOldEnd = traverse(outputStart, replacedExtent)
    let outputNewEnd = traverse(outputStart, replacementExtent)

    let {startNode, prefix} = this.iterator.insertSpliceStart(outputStart)
    let {endNode, suffix, suffixExtent} = this.iterator.insertSpliceEnd(outputOldEnd)
    startNode.priority = -1
    this.bubbleNodeUp(startNode)
    endNode.priority = -2
    this.bubbleNodeUp(endNode)

    startNode.right = null
    startNode.inputExtent = startNode.inputLeftExtent
    startNode.outputExtent = startNode.outputLeftExtent

    let endNodeOutputRightExtent = traversalDistance(endNode.outputExtent, endNode.outputLeftExtent)
    endNode.outputLeftExtent = traverse(outputNewEnd, suffixExtent)
    endNode.outputExtent = traverse(endNode.outputLeftExtent, endNodeOutputRightExtent)
    endNode.changeText = prefix + options.text + suffix

    startNode.priority = this.generateRandom()
    this.bubbleNodeDown(startNode)
    endNode.priority = this.generateRandom()
    this.bubbleNodeDown(endNode)
  }

  deleteNode (node) {
    node.priority = Infinity
    this.bubbleNodeDown(node)
    if (node.parent) {
      if (node.parent.left === node) {
        node.parent.left = null
      } else {
        node.parent.right = null
        node.parent.inputExtent = node.parent.inputLeftExtent
        node.parent.outputExtent = node.parent.outputLeftExtent
        let ancestor = node.parent
        while (ancestor.parent && ancestor.parent.right === ancestor) {
          ancestor.parent.inputExtent = traverse(ancestor.parent.inputLeftExtent, ancestor.inputExtent)
          ancestor.parent.outputExtent = traverse(ancestor.parent.outputLeftExtent, ancestor.outputExtent)
          ancestor = ancestor.parent
        }
      }
    } else {
      this.root = null
    }
  }

  bubbleNodeUp (node) {
    while (node.parent && node.priority < node.parent.priority) {
      if (node === node.parent.left) {
        this.rotateNodeRight(node)
      } else {
        this.rotateNodeLeft(node)
      }
    }
  }

  bubbleNodeDown (node) {
    while (true) {
      let leftChildPriority = node.left ? node.left.priority : Infinity
      let rightChildPriority = node.right ? node.right.priority : Infinity

      if (leftChildPriority < rightChildPriority && leftChildPriority < node.priority) {
        this.rotateNodeRight(node.left)
      } else if (rightChildPriority < node.priority) {
        this.rotateNodeLeft(node.right)
      } else {
        break
      }
    }
  }

  rotateNodeLeft (pivot) {
    let root = pivot.parent

    if (root.parent) {
      if (root === root.parent.left) {
        root.parent.left = pivot
      } else {
        root.parent.right = pivot
      }
    } else {
      this.root = pivot
    }
    pivot.parent = root.parent

    root.right = pivot.left
    if (root.right) {
      root.right.parent = root
    }

    pivot.left = root
    pivot.left.parent = pivot

    pivot.distanceFromLeftAncestor = addLogicalPositions(root.distanceFromLeftAncestor, pivot.distanceFromLeftAncestor)
  }

  rotateNodeRight (pivot) {
    let root = pivot.parent

    if (root.parent) {
      if (root === root.parent.left) {
        root.parent.left = pivot
      } else {
        root.parent.right = pivot
      }
    } else {
      this.root = pivot
    }
    pivot.parent = root.parent

    root.left = pivot.right
    if (root.left) {
      root.left.parent = root
    }

    pivot.right = root
    pivot.right.parent = pivot

    root.distanceFromLeftAncestor = subtractLogicalPositions(root.distanceFromLeftAncestor, pivot.distanceFromLeftAncestor)
  }

  generateRandom () {
    return this.randomGenerator.random()
  }
}
