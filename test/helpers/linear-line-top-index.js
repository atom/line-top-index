export default class LinearLineTopIndex {
  constructor (params = {}) {
    this.blocks = []
    this.setDefaultLineHeight(params.defaultLineHeight || 0)
  }

  setDefaultLineHeight (lineHeight) {
    this.defaultLineHeight = lineHeight
  }

  insertBlock (id, row, height, isAfterRow=false) {
    this.blocks.push({id, row, height, isAfterRow})
    this.sortBlocks()
  }

  resizeBlock (id, height) {
    let block = this.blocks.find((block) => block.id === id)
    if (block) {
      block.height = height
    }
  }

  moveBlock (id, newRow) {
    let block = this.blocks.find((block) => block.id === id)
    if (block) {
      block.row = newRow
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
    this.blocks.sort((a, b) => a.row - b.row)
  }

  allBlocks () {
    return this.blocks
  }

  getLastBlock () {
    return this.blocks[this.blocks.length - 1]
  }

  splice (start, oldExtent, newExtent) {
    if (oldExtent === 0 && newExtent === 0) return new Set()

    let oldEnd = start + oldExtent
    let newEnd = start + newExtent

    let touchedBlocks = new Set()

    this.blocks.forEach(block => {
      if (block.row >= start) {
        if (block.row > oldEnd) {
          block.row = newEnd + (block.row - oldEnd)
        } else {
          block.row = start + newExtent
          touchedBlocks.add(block.id)
        }
      }
    })

    this.sortBlocks()
    return touchedBlocks
  }

  pixelPositionForRow (row) {
    let linesHeight = row * this.defaultLineHeight
    let blocksHeight = this.blocks.filter(b => b.row < row || (b.row === row && !b.isAfterRow)).reduce((a, b) => a + b.height, 0)
    return linesHeight + blocksHeight
  }

  pixelPositionForFirstBlockAtRow (row) {
    let linesHeight = row * this.defaultLineHeight
    let blocksHeight = this.blocks.filter(b => b.row < row).reduce((a, b) => a + b.height, 0)
    return linesHeight + blocksHeight
  }

  rowForPixelPosition (top) {
    let precedingBlocksHeight = 0
    let lastBlockBottom = 0
    let lastBlockRow = 0

    for (let block of this.blocks) {
      let nextBlockTop = precedingBlocksHeight + (block.row * this.defaultLineHeight)
      if (nextBlockTop > top) break
      lastBlockRow = block.row
      lastBlockBottom = nextBlockTop + block.height
      precedingBlocksHeight += block.height
    }

    let overshootInPixels = Math.max(0, top - lastBlockBottom)
    let overshootInRows = Math.floor(overshootInPixels / this.defaultLineHeight)
    return lastBlockRow + overshootInRows
  }
}
