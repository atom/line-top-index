import Random from 'random-seed'
import Iterator from './iterator'
import {add as addLogicalPositions, subtract as subtractLogicalPositions} from './logical-position-helpers'

export default class LineTopIndex {
  constructor (params = {}) {
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
    let node = this.iterator.insertNode(row)
    if (node.priority == null) {
      node.priority = this.generateRandom()
      this.bubbleNodeUp(node)
    }

    this.adjustNodeBlockHeight(node, +blockHeight)

    node.blockIds.add(id)
    this.blockEndNodesById[id] = node
    this.blockHeightsById[id] = blockHeight
  }

  removeBlock (id) {
    let node = this.blockEndNodesById[id]
    let blockHeight = this.blockHeightsById[id]

    this.adjustNodeBlockHeight(node, -blockHeight)
    node.blockIds.delete(id)
    if (node.blockIds.size === 0) {
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

  splice (startRow, oldExtent, newExtent) {
    let oldEndRow = startRow + oldExtent
    let newEndRow = startRow + newExtent

    let startNode = this.iterator.insertNode(startRow)
    let endNode = this.iterator.insertNode(oldEndRow)

    startNode.priority = -1
    this.bubbleNodeUp(startNode)
    endNode.priority = -2
    this.bubbleNodeUp(endNode)

    if (startNode !== endNode) {
      let blockIdsToMove = new Set

      startNode.blockIds.forEach(function (id) {
        startNode.blockIds.delete(id)
        blockIdsToMove.add(id)
      })

      if (startNode.right) {
        this.collectBlockIdsForSubtree(startNode.right, blockIdsToMove)
        startNode.right = null
      }

      blockIdsToMove.forEach(id => {
        endNode.blockIds.add(id)
        endNode.blockHeight += this.blockHeightsById[id]
        this.blockEndNodesById[id] = endNode
      })
    }

    endNode.distanceFromLeftAncestor.rows = newEndRow

    if (startNode.blockIds.size > 0) {
      startNode.priority = this.generateRandom()
      this.bubbleNodeDown(startNode)
    } else {
      this.deleteNode(startNode)
    }

    if (endNode !== startNode) {
      if (endNode.blockIds.size > 0) {
        endNode.priority = this.generateRandom()
        this.bubbleNodeDown(endNode)
      } else {
        this.deleteNode(endNode)
      }
    }
  }

  pixelPositionForRow (row) {
    return (row * this.defaultLineHeight) + this.iterator.totalBlockPixelsPrecedingRow(row)
  }

  rowForPixelPosition (pixelPosition) {
    return this.iterator.rowForPixelPosition(pixelPosition, this.defaultLineHeight)
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

  collectBlockIdsForSubtree (node, blockIds) {
    node.blockIds.forEach(function (id) {
      blockIds.add(id)
    })
    if (node.left) this.collectBlockIdsForSubtree(node.left, blockIds)
    if (node.right) this.collectBlockIdsForSubtree(node.right, blockIds)
  }

  generateRandom () {
    return this.randomGenerator.random()
  }
}
