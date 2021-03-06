/**
 * 编译模板
 */

class Compiler {
  constructor(el, vm) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el // el可以是id 或者 document对象
    this.vm = vm
    // console.log([this.el])

    // 1.把el中所有的节点都存放到内存中
    let fragment = this.node2fragment(this.el)

    // 2.在内存中编译fragment
    this.compile(fragment)

    // 3.把fragmenty一次性添加到页面
    this.el.appendChild(fragment)
  }

  /**
   * ---------------------核心功能---------------------
   */

  // 编译fragment
  compile(fragment) {
    let nodeList = this.toArray(fragment.childNodes)

    nodeList.forEach((node) => {
      const { nodeType } = node

      // 文本节点
      if (nodeType === 3) {
        this.compileText(node)
      }

      // 元素节点
      if (nodeType === 1) {
        this.compileElement(node)

        // 元素节点递归编译
        if (node.childNodes.length) {
          this.compile(node)
        }
      }
    })
  }

  // 编译文本节点
  compileText(node) {
    CompileUtils.mustache(node, this.vm)
  }

  // 编译元素节点
  compileElement(node) {
    let attributes = this.toArray(node.attributes)
    attributes.forEach((attr) => {
      // console.dir(attr)
      const { name: attrName, value: expr } = attr

      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)

        /**
        // v-text
        if (type === 'text') {
          node.innerText = this.vm.$data[expr]
        }

        // v-html
        if (type === 'html') {
          node.innerHTML = this.vm.$data[expr]
        }

        // v-model
        if (type === 'model') {
          node.value = this.vm.$data[expr]
        }

        // v-on:[event]
        if (this.isEvent(type)) {
          const eventType = type.split(':')[1]
          node.addEventListener(eventType, this.vm.$methods[expr].bind(this.vm))
        }

        ↓↓↓↓↓↓↓↓优化如下↓↓↓↓↓↓↓↓
        */

        if (this.isEvent(type)) {
          // 处理事件

          CompileUtils.bindEvent(node, type, this.vm, expr)
        } else {
          // 处理指令

          CompileUtils[type] && CompileUtils[type](node, this.vm, expr)
        }
      }
    })
  }

  /**
   * ---------------------辅助功能---------------------
   */

  // 伪数组转数组
  toArray(likeArray) {
    return [].slice.call(likeArray)
  }

  // 节点转文档碎片
  node2fragment(el) {
    let nodeList = this.toArray(el.childNodes)
    let fragment = document.createDocumentFragment()

    // 把el中所有的子节点挨个添加到文档碎片中
    nodeList.map((node) => fragment.appendChild(node))
    // console.log(fragment)

    return fragment
  }

  // 指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  // 事件
  isEvent(attrName) {
    return attrName.split(':')[0] === 'on'
  }
}

/**
 * 编译工具
 */
let CompileUtils = {
  // 绑定的值为对象中的属性
  getVMValue(expr, vm) {
    let data = vm.$data
    expr.split('.').forEach((key) => (data = data[key]))
    return data
  },

  // 设置v-module绑定的值
  setVMValue(vm, expr, value) {
    let data = vm.$data
    let exprList = expr.split('.')
    exprList.forEach((key, i) => {
      if (i < exprList.length - 1) {
        // 如果没有遍历到最后一个属性，不断更新对象

        data = data[key]
      } else {
        // 最后一个则是需要被更新的属性

        data[key] = value
      }
    })
  },

  // 插值表达式
  mustacheReg: /\{\{(.+)\}\}/,
  mustache(node, vm) {
    let txt = node.nodeValue // 存储初始文本，之后的更新依然可以从初始文本中根据正则替换

    if (this.mustacheReg.test(txt)) {
      let expr = RegExp.$1
      let value = this.getVMValue(expr, vm)

      node.nodeValue = txt.replace(this.mustacheReg, value)

      // 每解析到一个指令，添加一个订阅者
      new Watcher(vm, expr, (oldValue, newValue) => {
        if (oldValue !== newValue) node.nodeValue = txt.replace(this.mustacheReg, newValue)
      })
    }
  },

  // v-text
  text(node, vm, expr) {
    node.innerText = this.getVMValue(expr, vm)

    // 每解析到一个指令，添加一个订阅者
    new Watcher(vm, expr, (oldValue, newValue) => {
      if (oldValue !== newValue) node.innerText = newValue
    })
  },

  // v-html
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(expr, vm)

    // 每解析到一个指令，添加一个订阅者
    new Watcher(vm, expr, (oldValue, newValue) => {
      if (oldValue !== newValue) node.innerHTML = newValue
    })
  },

  // v-model
  model(node, vm, expr) {
    node.value = this.getVMValue(expr, vm)

    // 每解析到一个指令，添加一个订阅者
    new Watcher(vm, expr, (oldValue, newValue) => {
      if (oldValue !== newValue) node.value = newValue
    })

    // 注册事件实现双向绑定
    let that = this
    node.addEventListener('input', function () {
      that.setVMValue(vm, expr, this.value)
    })
  },

  // v-on:[event]
  bindEvent(node, type, vm, expr) {
    const eventType = type.split(':')[1]
    // const fn = vm.$methods && vm.$methods[expr]
    const fn = vm[expr] && vm[expr]

    // 确保事件及方法都存在，避免js运行报错
    if (eventType && fn) node.addEventListener(eventType, fn.bind(vm))
  },
}
