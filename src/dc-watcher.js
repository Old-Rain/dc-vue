class Watcher {
  /**
   * @param {*} vm vm实例
   * @param {*} expr 监听的属性名
   * @param {*} cb 属性发生变动的回调
   */
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb

    // 在存储oldValue之前，先存储this
    Dependence.target = this

    // getVMValue会读取属性（已被劫持），从而触发属性的getter函数
    this.oldValue = this.getVMValue(expr, vm)

    // 每个订阅者添加完毕后清空，管杀管埋
    Dependence.target = null
  }

  /**
   * ---------------------核心功能---------------------
   */
  update() {
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.expr, this.vm)
    this.cb(oldValue, newValue)
  }

  /**
   * ---------------------辅助功能---------------------
   */
  getVMValue(expr, vm) {
    let value = vm.$data
    expr.split('.').forEach((expr) => (value = value[expr]))
    return value
  }
}

class Dependence {
  constructor() {
    this.subscribe = [] // 订阅者数组
  }

  // 添加订阅者
  addSubscribe(watcher) {
    this.subscribe.push(watcher)
  }

  // 通知订阅者
  notify() {
    // debugger
    this.subscribe.forEach((watcher) => {
      watcher.update()
    })
  }
}
