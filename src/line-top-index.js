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
    this.blockEndNodesById = {}
    this.blockHeightsById = {}
  }

  buildIterator () {
    return new Iterator(this)
  }

  insertBlock (id, row, blockHeight) {
    let node = this.iterator.insertBlockEnd(row)
    if (node.priority == null) {
      node.priority = this.generateRandom()
      this.bubbleNodeUp(node)
    }

    this.adjustNodeBlockHeight(node, +blockHeight)

    node.blockCount++
    this.blockEndNodesById[id] = node
    this.blockHeightsById[id] = blockHeight
  }

  removeBlock (id) {
    let node = this.blockEndNodesById[id]
    let blockHeight = this.blockHeightsById[id]

    this.adjustNodeBlockHeight(node, -blockHeight)
    node.blockCount--
    if (node.blockCount === 0) {
      this.deleteNode(node)
    }

    delete this.blockEndNodesById[id]
    delete this.blockHeightsById[id]
  }

  resizeBlock (id, newBlockHeight) {
    let node = this.blockEndNodesById[id]
    let blockHeight = this.blockHeightsById[id]
    let delta = newBlockHeight - blockHeight

    this.adjustNodeBlockHeight(node, delta)

    this.blockHeightsById[id] = newBlockHeight
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

  adjustNodeBlockHeight (node, delta) {
    node.blockHeight += delta
    node.distanceFromLeftAncestor.pixels += delta
    while (node.parent) {
      if (node.parent.left === node) {
        node.parent.distanceFromLeftAncestor.pixels += delta
      }
      node = node.parent
    }
  }

  generateRandom () {
    return this.randomGenerator.random()
  }
}
