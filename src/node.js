let idCounter = 0

export default class Node {
  constructor(parent, distanceFromLeftAncestor) {
    this.parent = parent
    this.left = null
    this.right = null
    this.distanceFromLeftAncestor = distanceFromLeftAncestor
    this.id = ++idCounter
    this.priority = null
    this.blockHeight = 0
    this.blockCount = 0
  }
}
