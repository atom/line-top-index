export const ZERO_POSITION = Object.freeze({row: 0, pixels: 0})

export function add (a, b) {
  return {
    row: a.row + b.row,
    pixels: a.pixels + b.pixels
  }
}

export function subtract (a, b) {
  return {
    row: a.row - b.row,
    pixels: a.pixels - b.pixels
  }
}

export function format (position) {
  return `(row: ${position.row}, pixels: ${position.pixels})`
}
