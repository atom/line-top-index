import Random from 'random-seed'
import Iterator from './iterator'
import {add as addLogicalPositions, subtract as subtractLogicalPositions} from './logical-position-helpers'
import {isZero, traverse, compare as comparePoints} from './point-helpers'

export default class LineTopIndex {
  constructor (params = {}) {
    this.setDefaultLineHeight(params.defaultLineHeight || 0)
    this.randomGenerator = new Random(params.seed || Date.now())
    this.root = null
    this.iterator = this.buildIterator()
    this.blockEndNodesById = {}
    this.blockHeightsById = {}
    this.inclusiveBlockIds = new Set
  }

  setDefaultLineHeight (lineHeight) {
    this.defaultLineHeight = lineHeight
  }

  buildIterator () {
    return new Iterator(this)
  }

  insertBlock (id, position, inclusive, blockHeight) {
    let node = this.iterator.insertNode(position)
    if (node.priority == null) {
      node.priority = this.generateRandom()
      this.bubbleNodeUp(node)
    }

    this.adjustNodeBlockHeight(node, +blockHeight)

    node.blockIds.add(id)
    this.blockEndNodesById[id] = node
    this.blockHeightsById[id] = blockHeight
    if (inclusive) this.inclusiveBlockIds.add(id)
  }

  setBlockInclusive (id, inclusive) {
    if (inclusive) {
      this.inclusiveBlockIds.add(id)
    } else {
      this.inclusiveBlockIds.delete(id)
    }
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

  moveBlock (id, newPosition) {
    let inclusive = this.inclusiveBlockIds.has(id)
    let blockHeight = this.blockHeightsById[id]
    this.removeBlock(id)
    this.insertBlock(id, newPosition, inclusive, blockHeight)
  }

  splice (start, oldExtent, newExtent, invalidateOldRange) {
    if (isZero(oldExtent) && isZero(newExtent)) return

    let oldEnd = traverse(start, oldExtent)
    let newEnd = traverse(start, newExtent)

    let isInsertion = isZero(oldExtent)
    let startNode = this.iterator.insertNode(start)
    let endNode = this.iterator.insertNode(oldEnd, !isInsertion)

    let invalidatedBlocks = new Set
    let blocksIdsToMove = new Set

    startNode.priority = -1
    this.bubbleNodeUp(startNode)
    endNode.priority = -2
    this.bubbleNodeUp(endNode)

    startNode.blockIds.forEach((id) => {
      if (!this.inclusiveBlockIds.has(id)) return

      startNode.blockIds.delete(id)
      startNode.blockHeight -= this.blockHeightsById[id]
      startNode.distanceFromLeftAncestor.pixels -= this.blockHeightsById[id]

      if (!isInsertion && invalidateOldRange) {
        invalidatedBlocks.add(id)
      } else {
        blocksIdsToMove.add(id)
      }
    })

    if (startNode.right) {
      this.blockIdsForSubtree(startNode.right).forEach((id) => {
        if (invalidateOldRange) {
          invalidatedBlocks.add(id)
        } else {
          blocksIdsToMove.add(id)
        }
      })

      startNode.right = null
    }

    invalidatedBlocks.forEach(id => {
      endNode.distanceFromLeftAncestor.pixels -= this.blockHeightsById[id]
      delete this.blockEndNodesById[id]
      delete this.blockHeightsById[id]
    })

    blocksIdsToMove.forEach(id => {
      endNode.blockIds.add(id)
      endNode.blockHeight += this.blockHeightsById[id]
      this.blockEndNodesById[id] = endNode
    })

    endNode.distanceFromLeftAncestor.point = newEnd

    if (comparePoints(startNode.distanceFromLeftAncestor.point, endNode.distanceFromLeftAncestor.point) === 0) {
      endNode.blockIds.forEach((id) => {
        startNode.blockIds.add(id)
        startNode.blockHeight += this.blockHeightsById[id]
        startNode.distanceFromLeftAncestor.pixels += this.blockHeightsById[id]
        this.blockEndNodesById[id] = startNode
      })

      this.deleteNode(endNode)
    } else if (endNode.blockIds.size > 0) {
      endNode.priority = this.generateRandom()
      this.bubbleNodeDown(endNode)
    } else {
      this.deleteNode(endNode)
    }

    if (startNode.blockIds.size > 0) {
      startNode.priority = this.generateRandom()
      this.bubbleNodeDown(startNode)
    } else {
      this.deleteNode(startNode)
    }

    return invalidatedBlocks
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

  blockIdsForSubtree (node, blockIds = new Set()) {
    node.blockIds.forEach(function (id) {
      blockIds.add(id)
    })
    if (node.left) this.blockIdsForSubtree(node.left, blockIds)
    if (node.right) this.blockIdsForSubtree(node.right, blockIds)

    return blockIds
  }

  generateRandom () {
    return this.randomGenerator.random()
  }
}
