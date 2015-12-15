import {compare, traverse, traversal} from '../../src/point-helpers'

export default class LineTopIndex {
  constructor (params = {}) {
    this.blocks = []
    this.maxRow = params.maxRow || 0
    this.setDefaultLineHeight(params.defaultLineHeight || 0)
  }

  setDefaultLineHeight (lineHeight) {
    this.defaultLineHeight = lineHeight
  }

  getMaxRow () {
    return this.maxRow
  }

  insertBlock (id, position, height) {
    this.blocks.push({id, position, height})
    this.blocks.sort((a, b) => compare(a.position, b.position))
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
      this.blocks.sort((a, b) => compare(a.position, b.position))
    }
  }

  removeBlock (id) {
    let index = this.blocks.findIndex((block) => block.id === id)
    if (index !== -1) {
      this.blocks.splice(index, 1)
    }
  }

  allBlocks () {
    return this.blocks
  }

  splice (start, oldExtent, newExtent) {
    this.blocks.forEach(function (block) {
      if (compare(block.position, start) >= 0) {
        if (compare(block.position, traverse(start, oldExtent)) >= 0) {
          block.position = traverse(block.position, traversal(newExtent, oldExtent))
        } else {
          block.position = traverse(start, newExtent)
        }
      }
    })

    this.maxRow = this.maxRow + traversal(newExtent, oldExtent).row
  }

  pixelPositionForRow (row) {
    row = Math.min(row, this.maxRow)
    let linesHeight = row * this.defaultLineHeight
    let blocksHeight = this.blocks.filter((block) => block.position.row <= row).reduce((a, b) => a + b.height, 0)
    return linesHeight + blocksHeight
  }

  rowForPixelPosition (top, strategy) {
    const roundingStrategy = strategy || 'floor'
    let blocksHeight = 0
    let lastRow = 0
    let lastTop = 0
    for (let block of this.blocks) {
      let nextBlocksHeight = blocksHeight + block.height
      let linesHeight = block.position.row * this.defaultLineHeight
      if (nextBlocksHeight + linesHeight > top) {
        while (lastRow < block.position.row && lastTop + this.defaultLineHeight <= top) {
          lastTop += this.defaultLineHeight
          lastRow++
        }
        return lastRow
      } else {
        blocksHeight = nextBlocksHeight
        lastRow = block.position.row
        lastTop = blocksHeight + linesHeight
      }
    }

    let remainingHeight = Math.max(0, top - lastTop)
    let remainingRows = Math.min(this.maxRow, lastRow + remainingHeight / this.defaultLineHeight)
    switch (roundingStrategy) {
      case 'floor':
        return Math.floor(remainingRows)
      case 'ceil':
        return Math.ceil(remainingRows)
      default:
        throw new Error(`Cannot use '${roundingStrategy}' as a rounding strategy!`)
    }
  }
}
