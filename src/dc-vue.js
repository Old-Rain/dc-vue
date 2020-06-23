class Vue {
  constructor(options = {}) {
    if (!options.el) return

    const { el, data, methods } = options
    this.$el = el
    this.$data = data
    this.$methods = methods

    new Observer(this.$data)

    new Compile(this.$el, this)
  }
}
