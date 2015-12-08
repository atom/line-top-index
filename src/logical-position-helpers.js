export const ZERO_POSITION = Object.freeze({rows: 0, pixels: 0})

export function add (a, b) {
  return {
    rows: a.rows + b.rows,
    pixels: a.pixels + b.pixels
  }
}

export function format (position) {
  return `(rows: ${position.rows}, pixels: ${position.pixels})`
}
