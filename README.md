# line-top-index

This is a module used by Atom to keep track of block decorations and to efficiently compute spatial conversions from pixels to rows and viceversa.

## Example

```js
let lineTopIndex = new LineTopIndex({defaultLineHeight: 42})
lineTopIndex.insertBlock(1, 0, 100, true)
lineTopIndex.insertBlock(2, 3, 100, false)

lineTopIndex.splice(2, 1, 3)

lineTopIndex.pixelPositionBeforeBlocksForRow(0) // => 0
lineTopIndex.pixelPositionAfterBlocksForRow(0) // => 100
lineTopIndex.rowForPixelPosition(30) // => 1
```

## API

### `insertBlock(id, row, height, isAfter)`

Inserts a block with the given `id` and `height` into the specified `row`. `isAfter` determines whether the block should be placed before or after the row.

### `resizeBlock(id, newHeight)`

Resizes the block corresponding to the given `id` with the specified `newHeight`.

### `moveBlock(id, newRow)`

Moves the block corresponding to the given `id` to `newRow`.

### `deleteBlock(id)`

Deletes the block corresponding to the given `id`.

### `setDefaultLineHeight(lineHeight)`

Changes the default line height to `lineHeight`.

### `splice(start, oldExtent, newExtent)`

Update the locations of all the blocks based on the description of a change to the text. The range of the replaced text is described by traversing from start by oldExtent. The range of the new text is described by traversing from start to newExtent. All the positions are expressed in terms of rows.

This method returns a `Set` that describes which block decorations were touched during the splice operation.

### `pixelPositionBeforeBlocksForRow(row)`

Returns the pixel position of the passed `row`, taking into account the height of block decorations before it but excluding the ones that immediately precede it.

### `pixelPositionAfterBlocksForRow(row)`

Returns the pixel position of the passed `row`, taking into account the height of block decorations before it and including the ones that immediately precede it.

### `rowForPixelPosition(pixels)`

Returns the row corresponding to the passed `pixels`. If the given pixel position lies inside a block, the corresponding row for that block will be returned.
