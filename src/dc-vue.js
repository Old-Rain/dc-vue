class Vue {
  constructor(options = {}) {
    if (!options.el) return

    const { el, data, methods } = options
    this.$el = el
    this.$data = data
    this.$methods = methods

    // 将data和methods中所有的属性和方法，都代理到this上
    this.proxy(this.$data)
    this.proxy(this.$methods)

    new Observer(this.$data)

    new Compile(this.$el, this)
  }

  // 代理
  proxy(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newValue) {
          // 触发setter函数的时候，如果与原值相等就算了
          if (data[key] !== newValue) data[key] = newValue
        },
      })
    })
  }
}
