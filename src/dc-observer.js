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
    Object.defineProperty(obj, prop, {
      get: () => {
        console.log('执行了get', value)

        return value
      },

      set: (newValue) => {
        console.log('执行了set', newValue)

        value = newValue

        // 新值是对象那么对内部的属性继续劫持
        this.walk(value)
      },
    })
  }
}
