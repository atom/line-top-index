import Random from 'random-seed'
import LinearLineTopIndex from './helpers/linear-line-top-index'
import LineTopIndex from '../src/line-top-index'
import {traverse, format as formatPoint, ZERO as ZERO_POINT} from '../src/point-helpers'

let idCounter

describe('LineTopIndex', () => {
  it('determines line heights correctly after randomized insertions, removals, and splices', function () {
    this.timeout(Infinity)

    for (let i = 0; i < 7000; i++) {
      let seed = Date.now()
      let random = new Random(seed)

      let maxRow = random.intBetween(10, 50)
      let defaultLineHeight = 10
      let referenceIndex = new LinearLineTopIndex({defaultLineHeight, maxRow})
      let actualIndex = new LineTopIndex({seed, defaultLineHeight, maxRow})
      idCounter = 1

      for (let j = 0; j < 900; j++) {
        let k = random(10)
        if (k < 3) {
          performInsertion(random, actualIndex, referenceIndex)
        } else if (k < 5) {
          performRemoval(random, actualIndex, referenceIndex)
        } else if (k < 6) {
          performResize(random, actualIndex, referenceIndex)
        } else if (k < 7) {
          performMove(random, actualIndex, referenceIndex)
        } else {
          performSplice(random, actualIndex, referenceIndex)
        }

        // document.write('<hr>')
        // document.write(actualIndex.toHTML())
        // document.write('<hr>')
      }

      verifyIndex(random, actualIndex, referenceIndex, `Seed: ${seed}`)
    }
  })
})

function verifyIndex (random, actualIndex, referenceIndex, message) {
  let lastReferenceBlock = referenceIndex.getLastBlock()
  if (!lastReferenceBlock) return

  for (let row = 0; row <= lastReferenceBlock.position.row + 5; row++) {
    let rowPixelPosition = referenceIndex.pixelPositionForRow(row)
    let nextRowPixelPosition = referenceIndex.pixelPositionForRow(row + 1)
    let betweenRowsPixelPosition = random.intBetween(rowPixelPosition, nextRowPixelPosition)

    assert.equal(actualIndex.pixelPositionForRow(row), rowPixelPosition, message)
    assert.equal(actualIndex.rowForPixelPosition(betweenRowsPixelPosition), referenceIndex.rowForPixelPosition(betweenRowsPixelPosition), message)
  }
}

function performInsertion (random, actualIndex, referenceIndex) {
  let start = randomPoint(random, 100, 100)
  let height = random(100 + 1)
  let id = idCounter++
  let inclusive = Boolean(random(2))

  // document.write(`<div>performInsertion(${id}, ${formatPoint(start)}, ${height})</div>`)

  referenceIndex.insertBlock(id, start, inclusive, height)
  actualIndex.insertBlock(id, start, inclusive, height)
}

function performRemoval (random, actualIndex, referenceIndex) {
  if (referenceIndex.allBlocks().length === 0) return

  let id = getRandomBlockId(random, referenceIndex)

  // document.write(`<div>performRemoval(${id})</div>`)

  referenceIndex.removeBlock(id)
  actualIndex.removeBlock(id)
}

function performMove (random, actualIndex, referenceIndex) {
  if (referenceIndex.allBlocks().length === 0) return

  let id = getRandomBlockId(random, referenceIndex)
  let newPosition = randomPoint(random, 100, 100)

  // document.write(`<div>performMove(${id}, ${formatPoint(newPosition)})</div>`)

  referenceIndex.moveBlock(id, newPosition)
  actualIndex.moveBlock(id, newPosition)
}

function performResize (random, actualIndex, referenceIndex) {
  if (referenceIndex.allBlocks().length === 0) return

  let id = getRandomBlockId(random, referenceIndex)
  let newHeight = random(100 + 1)

  // document.write(`<div>performResize(${id}, ${newHeight})</div>`)

  referenceIndex.resizeBlock(id, newHeight)
  actualIndex.resizeBlock(id, newHeight)
}

function performSplice (random, actualIndex, referenceIndex) {
  let start = randomPoint(random, 100, 100)
  let oldExtent = ZERO_POINT
  while (random(2) > 0) oldExtent = traverse(oldExtent, randomPoint(random, 5, 5))
  let newExtent = ZERO_POINT
  while (random(2) > 0) newExtent = traverse(newExtent, randomPoint(random, 5, 5))
  let invalidateOldRange = Boolean(random(2))

  // document.write(`<div>performSplice(${formatPoint(start)}, ${formatPoint(oldExtent)}, ${formatPoint(newExtent)})</div>`)

  referenceIndex.splice(start, oldExtent, newExtent, invalidateOldRange)
  actualIndex.splice(start, oldExtent, newExtent, invalidateOldRange)
}

function randomPoint(random, maxRow, maxColumn) {
  return {row: random(maxRow), column: random(maxColumn)}
}

function getRandomBlockId (random, referenceIndex) {
  let blocks = referenceIndex.allBlocks()
  let block = blocks[random(blocks.length)]
  return block.id
}
