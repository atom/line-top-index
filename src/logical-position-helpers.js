import {traverse, traversal, format as formatPoint, ZERO as ZERO_POINT} from './point-helpers'

export const ZERO_POSITION = Object.freeze({point: ZERO_POINT, pixels: 0})

export function add (a, b) {
  return {
    point: traverse(a.point, b.point),
    pixels: a.pixels + b.pixels
  }
}

export function subtract (a, b) {
  return {
    point: traversal(a.point, b.point),
    pixels: a.pixels - b.pixels
  }
}

export function format (position) {
  return `(point: ${formatPoint(position.point)}, pixels: ${position.pixels})`
}
