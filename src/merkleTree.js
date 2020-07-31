// todo ensure consistent types in tree and inserted elements?

/**
 * @callback hashFunction
 * @param left Left leaf
 * @param right Right leaf
 */
/**
 * Merkle tree
 */
class MerkleTree {
  /**
   * Constructor
   * @param {number} levels Number of levels in the tree
   * @param {Array} [elements] Initial elements
   * @param {hashFunction} hashFunction Function used to hash 2 leaves
   * @param [zeroElement] Value for non-existent leaves
   */
  constructor(levels, elements = [], hashFunction, zeroElement = 0) {
    this.levels = levels
    this.capacity = 2 << levels
    this.zeroElement = zeroElement
    this._hash = hashFunction ?? ((a, b) => a + b)

    this._zeros = []
    this._layers = []
    this._layers[0] = elements
    this._zeros[0] = this.zeroElement
    for (let i = 1; i <= levels; i++) {
      this._zeros[i] = this._hash(this._zeros[i - 1], this._zeros[i - 1])
    }
    this._rebuild()
  }

  _rebuild() {
    for (let level = 1; level <= this.levels; level++) {
      this._layers[level] = []
      for (let i = 0; i < Math.ceil(this._layers[level - 1].length / 2); i++) {
        this._layers[level][i] = this._hash(
          this._layers[level - 1][i * 2],
          this._layers[level - 1]?.[i * 2 + 1] ?? this._zeros[level - 1],
        )
      }
    }
  }

  /**
   * Get tree root
   * @returns {*}
   */
  root() {
    return this._layers[this.levels]?.[0] ?? this._zeros[this.levels]
  }

  /**
   * Insert new element into the tree
   * @param element Element to insert
   */
  insert(element) {
    if (this._layers[0].length >= this.capacity) {
      throw new Error('Tree is full')
    }
    this.update(this._layers[0].length, element)
  }

  /**
   * Insert multiple elements into the tree. Tree will be fully rebuilt during this operation.
   * @param {Array} elements Elements to insert
   */
  bulkInsert(elements) {
    if (this._layers[0].length + elements.length > this.capacity) {
      throw new Error('Tree is full')
    }
    this._layers[0].push(...elements)
    this._rebuild()
  }

  /**
   * Change an element in the tree
   * @param {number} index Index of element to change
   * @param element Updated element value
   */
  update(index, element) {
    if (index < 0 || index > this._layers[0].length || index >= this.capacity) {
      throw new Error('Insert index out of bounds: ' + index)
    }
    this._layers[0][index] = element
    for (let level = 1; level <= this.levels; level++) {
      index >>= 1
      this._layers[level][index] = this._hash(
        this._layers[level - 1][index * 2],
        this._layers[level - 1]?.[index * 2 + 1] ?? this._zeros[level - 1],
      )
    }
  }

  /**
   * Get merkle proof for a leaf
   * @param index Leaf index to generate proof for
   * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
   */
  proof(index) {
    if (index < 0 || index >= this._layers[0].length) {
      throw new Error('Index out of bounds: ' + index)
    }
    const pathElements = []
    const pathIndex = []
    for (let level = 0; level < this.levels; level++) {
      pathIndex[level] = index % 2
      pathElements[level] = this._layers[level]?.[index ^ 1] ?? this._zeros[level]
      index >>= 1
    }
    return {
      pathElements,
      pathIndex,
    }
  }

  /**
   * Find an element in the tree
   * @param element An element to find
   * @returns {number} Index if element is found, otherwise -1
   */
  indexOf(element) {
    return this._layers[0].indexOf(element)
  }
}

module.exports = MerkleTree
