import {compare, traverse, traversal} from '../../src/point-helpers'

export default class LinearLineTopIndex {
  constructor (params = {}) {
    this.blocks = []
    this.setDefaultLineHeight(params.defaultLineHeight || 0)
  }

  setDefaultLineHeight (lineHeight) {
    this.defaultLineHeight = lineHeight
  }

  insertBlock (id, position, isInclusive, height) {
    this.blocks.push({id, position, isInclusive, height})
    this.sortBlocks()
  }

  setBlockInclusive (id, isInclusive) {
    let block = this.blocks.find((block) => block.id === id)
    if (block) {
      block.isInclusive = isInclusive
    }
  }

  resizeBlock (id, height) {
    let block = this.blocks.find((block) => block.id === id)
    if (block) {
      block.height = height
    }
  }

  moveBlock (id, newPosition) {
    let block = this.blocks.find((block) => block.id === id)
    if (block) {
      block.position = newPosition
      this.sortBlocks()
    }
  }

  removeBlock (id) {
    let index = this.blocks.findIndex((block) => block.id === id)
    if (index !== -1) {
      this.blocks.splice(index, 1)
    }
  }

  sortBlocks () {
    this.blocks.sort((a, b) => compare(a.position, b.position))
  }

  allBlocks () {
    return this.blocks
  }

  splice (start, oldExtent, newExtent) {
    this.blocks.forEach(function (block) {
      let comparison = compare(block.position, start)
      if (comparison > 0 || (comparison >= 0 && block.isInclusive)) {
        if (compare(block.position, traverse(start, oldExtent)) >= 0) {
          block.position = traverse(block.position, traversal(newExtent, oldExtent))
        } else {
          block.position = traverse(start, newExtent)
        }
      }
    })
    this.sortBlocks()
  }

  pixelPositionForRow (row) {
    let linesHeight = row * this.defaultLineHeight
    let blocksHeight = this.blocks.filter((block) => block.position.row <= row).reduce((a, b) => a + b.height, 0)
    return linesHeight + blocksHeight
  }

  rowForPixelPosition (top) {
    let precedingBlocksHeight = 0
    let lastBlockBottom = 0
    let lastBlockRow = 0

    for (let block of this.blocks) {
      let nextBlockTop = precedingBlocksHeight + (block.position.row * this.defaultLineHeight)
      if (nextBlockTop > top) break
      lastBlockRow = block.position.row
      lastBlockBottom = nextBlockTop + block.height
      precedingBlocksHeight += block.height
    }

    let overshootInPixels = Math.max(0, top - lastBlockBottom)
    let overshootInRows = Math.floor(overshootInPixels / this.defaultLineHeight)
    return lastBlockRow + overshootInRows
  }
}
