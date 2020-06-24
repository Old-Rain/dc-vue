/**
 * observer用于给data中所有的数据添加getter和setter
 */

class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  // 遍历data中所有的数据，添加getter和setter
  walk(data) {
    // data不是对象，return掉
    if (!data || typeof data !== 'object') return

    Object.keys(data).forEach((prop) => {
      this.defineReactive(data, prop, data[prop])

      // 递归劫持，保证对象中的对象中...的对象中的属性都能被劫持到
      this.walk(data[prop])
    })
  }

  // 定义响应式的数据
  defineReactive(obj, prop, value) {
    // 每一个属性，依赖（dependence）一个发布者
    let dependence = new Dependence()

    Object.defineProperty(obj, prop, {
      get: () => {
        // console.log('执行了get', value)

        /**
         * 当指令被解析，并添加到订阅者时（创建Watcher的实例对象）
         * 先将watcher添加到Dependence.target
         * 再将oldValue存储起来，同时会触发属性的getter函数
         * 在getter中执行dependence.addSubscribe()，将每个指令的订阅者（watcher）添加到dependence的发布者数组（subscribe）
         * 最后将Dependence.target清空，使初始化完成之后，触发getter函数时不会再执行addSubscribe
         */
        Dependence.target && dependence.addSubscribe(Dependence.target)

        return value
      },

      set: (newValue) => {
        // console.log('执行了set', newValue)

        value = newValue

        // 新值是对象那么对内部的属性继续劫持
        this.walk(value)

        /**
         * 每次属性更新，触发setter函数的时候
         * 遍历dependence中存储的subscribe，逐个更新
         */
        dependence.notify()
      },
    })
  }
}
