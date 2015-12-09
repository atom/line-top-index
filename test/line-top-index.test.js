import Random from 'random-seed'
import LinearLineTopIndex from './helpers/linear-line-top-index'
import LineTopIndex from '../src/line-top-index'

describe('LineTopIndex', () => {
  it.only('determines line heights correctly after randomized insertions, removals, and splices', function () {
    this.timeout(Infinity)

    for (let i = 0; i < 1000; i++) {
      let seed = Date.now()
      let random = new Random(seed)

      let maxRow = random.intBetween(10, 50)
      let defaultLineHeight = 10
      let referenceIndex = new LinearLineTopIndex({defaultLineHeight, maxRow})
      let actualIndex = new LineTopIndex({defaultLineHeight, maxRow})

      for (let j = 0; j < 50; j++) {
        performInsertion(random, actualIndex, referenceIndex)

        // let k = random(10)
        // if (k < 3) {
        //   performInsertion(random, actualIndex, referenceIndex)
        // } else if (k < 6) {
        //   performRemoval(random, referenceIndex, referenceIndex)
        // } else {
        //   performSplice(random, referenceIndex, referenceIndex)
        // }
      }

      // document.write('<hr>')
      // document.write(actualIndex.toHTML())
      // document.write('<hr>')

      verifyIndex(random, actualIndex, referenceIndex, `Seed: ${seed}`)
    }
  })
})

function verifyIndex (random, actualIndex, referenceIndex, message) {
  for (let row = 0; row <= referenceIndex.getMaxRow(); row++) {
    let rowPixelPosition = referenceIndex.pixelPositionForRow(row)
    let nextRowPixelPosition = referenceIndex.pixelPositionForRow(row + 1)
    let betweenRowsPixelPosition = random.intBetween(rowPixelPosition, nextRowPixelPosition)

    assert.equal(actualIndex.pixelPositionForRow(row), rowPixelPosition, message)
    assert.equal(actualIndex.rowForPixelPosition(betweenRowsPixelPosition), referenceIndex.rowForPixelPosition(betweenRowsPixelPosition), message)
  }
}

function performInsertion (random, actualIndex, referenceIndex) {
  let row = random(referenceIndex.getMaxRow() + 1)
  let height = random(100 + 1)

  referenceIndex.insertBlock(row, height)
  actualIndex.insertBlock(row, height)
}

function performRemoval (random, actualIndex, referenceIndex) {
  if (referenceIndex.allBlocks().length === 0) return

  let id = getRandomBlockId(random, referenceIndex)
  referenceIndex.removeBlock(id)
  actualIndex.removeBlock(id)
}

function performSplice (random, actualIndex, referenceIndex) {
  let maxRow = referenceIndex.getMaxRow()
  let startRow = random(maxRow + 1)

  let oldExtent = random(maxRow - startRow)
  let newExtent = 0
  while (random(2) > 0) newExtent += random(5)

  referenceIndex.splice(startRow, oldExtent, newExtent)
  actualIndex.splice(startRow, oldExtent, newExtent)
}

function getRandomBlockId (random, referenceIndex) {
  let blocks = referenceIndex.allBlocks()
  let block = blocks[random(block.length)]
  return block.id
}
