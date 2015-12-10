import LineTopIndex from './helpers/linear-line-top-index'

describe('LineTopIndex', function () {
  let lineTopIndex

  beforeEach(function () {
    lineTopIndex = new LineTopIndex({defaultLineHeight: 10, maxRow: 12})
  })

  describe('.prototype.pixelPositionForRow(row)', function () {
    it('performs the simple math when there are no block decorations', function () {
      assert.equal(lineTopIndex.pixelPositionForRow(0), 0 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(4), 4 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(5), 5 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(12), 12 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(13), 12 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(14), 12 * 10)

      lineTopIndex.splice(0, 2, 3)

      assert.equal(lineTopIndex.pixelPositionForRow(0), 0 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(4), 4 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(5), 5 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(12), 12 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(13), 13 * 10)
      assert.equal(lineTopIndex.pixelPositionForRow(14), 13 * 10)
    })

    it('takes into account inserted and removed blocks', function () {
      lineTopIndex.insertBlock(1, 0, 10)
      lineTopIndex.insertBlock(2, 3, 20)
      lineTopIndex.insertBlock(3, 5, 20)

      assert.equal(lineTopIndex.pixelPositionForRow(0), (0 * 10) + 10)
      assert.equal(lineTopIndex.pixelPositionForRow(1), (1 * 10) + 10)
      assert.equal(lineTopIndex.pixelPositionForRow(2), (2 * 10) + 10)
      assert.equal(lineTopIndex.pixelPositionForRow(3), (3 * 10) + 10 + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(4), (4 * 10) + 10 + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(5), (5 * 10) + 10 + 20 + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(6), (6 * 10) + 10 + 20 + 20)

      lineTopIndex.removeBlock(1)
      lineTopIndex.removeBlock(3)

      assert.equal(lineTopIndex.pixelPositionForRow(0), (0 * 10))
      assert.equal(lineTopIndex.pixelPositionForRow(1), (1 * 10))
      assert.equal(lineTopIndex.pixelPositionForRow(2), (2 * 10))
      assert.equal(lineTopIndex.pixelPositionForRow(3), (3 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(4), (4 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(5), (5 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(6), (6 * 10) + 20)
    })

    it('moves blocks down/up when splicing regions', function () {
      lineTopIndex.insertBlock(1, 3, 20)
      lineTopIndex.insertBlock(2, 5, 30)

      lineTopIndex.splice(0, 0, 4)

      assert.equal(lineTopIndex.pixelPositionForRow(0), (0 * 10) + 0)
      assert.equal(lineTopIndex.pixelPositionForRow(6), (6 * 10) + 0)
      assert.equal(lineTopIndex.pixelPositionForRow(7), (7 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(8), (8 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(9), (9 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(10), (10 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(11), (11 * 10) + 20 + 30)

      lineTopIndex.splice(0, 6, 2)

      assert.equal(lineTopIndex.pixelPositionForRow(0), (0 * 10) + 0)
      assert.equal(lineTopIndex.pixelPositionForRow(3), (3 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(4), (4 * 10) + 20)
      assert.equal(lineTopIndex.pixelPositionForRow(5), (5 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(6), (6 * 10) + 20 + 30)

      lineTopIndex.splice(2, 4, 0)

      assert.equal(lineTopIndex.pixelPositionForRow(0), (0 * 10) + 0)
      assert.equal(lineTopIndex.pixelPositionForRow(1), (1 * 10) + 0)
      assert.equal(lineTopIndex.pixelPositionForRow(2), (2 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(3), (3 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(4), (4 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(5), (5 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(6), (6 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(7), (7 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(8), (8 * 10) + 20 + 30)
      assert.equal(lineTopIndex.pixelPositionForRow(9), (8 * 10) + 20 + 30)
    })
  })

  describe('.prototype.rowForPixelPosition(top)', function () {
    it('performs the simple math when there are no block decorations', function () {
      assert.equal(lineTopIndex.rowForPixelPosition(0 * 10), 0)
      assert.equal(lineTopIndex.rowForPixelPosition(0 * 10 + 8), 0)
      assert.equal(lineTopIndex.rowForPixelPosition(4 * 10), 4)
      assert.equal(lineTopIndex.rowForPixelPosition(4 * 10 + 3), 4)
      assert.equal(lineTopIndex.rowForPixelPosition(5 * 10), 5)
      assert.equal(lineTopIndex.rowForPixelPosition(12 * 10), 12)
      assert.equal(lineTopIndex.rowForPixelPosition(13 * 10), 12)
      assert.equal(lineTopIndex.rowForPixelPosition(14 * 10), 12)

      lineTopIndex.splice(0, 2, 3)

      assert.equal(lineTopIndex.rowForPixelPosition(0 * 10), 0)
      assert.equal(lineTopIndex.rowForPixelPosition(4 * 10), 4)
      assert.equal(lineTopIndex.rowForPixelPosition(5 * 10), 5)
      assert.equal(lineTopIndex.rowForPixelPosition(12 * 10), 12)
      assert.equal(lineTopIndex.rowForPixelPosition(13 * 10), 13)
      assert.equal(lineTopIndex.rowForPixelPosition(14 * 10), 13)
    })

    it('takes into account inserted and removed blocks', function () {
      lineTopIndex.insertBlock(1, 0, 10)
      lineTopIndex.insertBlock(2, 3, 20)
      lineTopIndex.insertBlock(3, 5, 20)

      assert.equal(lineTopIndex.rowForPixelPosition((0 * 10) + 10), 0)
      assert.equal(lineTopIndex.rowForPixelPosition((1 * 10) + 10), 1)
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 10), 2)
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 10 + 9), 2) // inside row 2
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 10 + 10), 3) // inside block
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 10 + 11), 3) // inside block
      assert.equal(lineTopIndex.rowForPixelPosition((3 * 10) + 10 + 20), 3)
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 10 + 20), 4)
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 10 + 20 + 9), 4) // inside row 4
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 10 + 20 + 10), 5) // inside block
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 10 + 20 + 11), 5) // inside block
      assert.equal(lineTopIndex.rowForPixelPosition((5 * 10) + 10 + 20 + 20), 5)
      assert.equal(lineTopIndex.rowForPixelPosition((6 * 10) + 10 + 20 + 20), 6)

      lineTopIndex.removeBlock(1)
      lineTopIndex.removeBlock(3)

      assert.equal(lineTopIndex.rowForPixelPosition((0 * 10)), 0)
      assert.equal(lineTopIndex.rowForPixelPosition((1 * 10)), 1)
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10)), 2)
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 9), 2) // inside row 2
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 10), 3) // inside block
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 11), 3) // inside block
      assert.equal(lineTopIndex.rowForPixelPosition((3 * 10) + 20), 3)
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 20), 4)
      assert.equal(lineTopIndex.rowForPixelPosition((5 * 10) + 20), 5)
      assert.equal(lineTopIndex.rowForPixelPosition((6 * 10) + 20), 6)
    })

    it('moves blocks down/up when splicing regions', function () {
      lineTopIndex.insertBlock(1, 3, 20)
      lineTopIndex.insertBlock(2, 5, 30)

      lineTopIndex.splice(0, 0, 4)

      assert.equal(lineTopIndex.rowForPixelPosition((0 * 10) + 0), 0)
      assert.equal(lineTopIndex.rowForPixelPosition((6 * 10) + 0), 6)
      assert.equal(lineTopIndex.rowForPixelPosition((7 * 10) + 20), 7)
      assert.equal(lineTopIndex.rowForPixelPosition((8 * 10) + 20), 8)
      assert.equal(lineTopIndex.rowForPixelPosition((9 * 10) + 20 + 30), 9)
      assert.equal(lineTopIndex.rowForPixelPosition((10 * 10) + 20 + 30), 10)
      assert.equal(lineTopIndex.rowForPixelPosition((11 * 10) + 20 + 30), 11)

      lineTopIndex.splice(0, 6, 2)

      assert.equal(lineTopIndex.rowForPixelPosition((0 * 10) + 0), 0)
      assert.equal(lineTopIndex.rowForPixelPosition((3 * 10) + 20), 3)
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 20), 4)
      assert.equal(lineTopIndex.rowForPixelPosition((5 * 10) + 20 + 30), 5)
      assert.equal(lineTopIndex.rowForPixelPosition((6 * 10) + 20 + 30), 6)

      lineTopIndex.splice(2, 4, 0)

      assert.equal(lineTopIndex.rowForPixelPosition((0 * 10) + 0), 0)
      assert.equal(lineTopIndex.rowForPixelPosition((1 * 10) + 0), 1)
      assert.equal(lineTopIndex.rowForPixelPosition((2 * 10) + 0), 2)
      assert.equal(lineTopIndex.rowForPixelPosition((3 * 10) + 20 + 30), 3)
      assert.equal(lineTopIndex.rowForPixelPosition((4 * 10) + 20 + 30), 4)
      assert.equal(lineTopIndex.rowForPixelPosition((5 * 10) + 20 + 30), 5)
      assert.equal(lineTopIndex.rowForPixelPosition((6 * 10) + 20 + 30), 6)
      assert.equal(lineTopIndex.rowForPixelPosition((7 * 10) + 20 + 30), 7)
      assert.equal(lineTopIndex.rowForPixelPosition((8 * 10) + 20 + 30), 8)
      assert.equal(lineTopIndex.rowForPixelPosition((9 * 10) + 20 + 30), 8)
    })
  })
})
