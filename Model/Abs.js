class Abs {
  constructor() {
    if (new.target === Abs) {
      throw new Error('Cannot instantiate abstract class')
    }

    const methods = ['create', 'update', 'delete']

    methods.forEach(method => {
      if (this[method] === Abs.prototype[method]) {
        throw new Error(`${method} must be implemented`)
      }
    })
  }

  create() {
    throw new Error('create must be implemented')
  }

  update() {
    throw new Error('update must be implemented')
  }

  delete() {
    throw new Error('delete must be implemented')
  }
}

export default Abs
