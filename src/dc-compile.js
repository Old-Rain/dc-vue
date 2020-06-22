/**
 * 编译模板
 */

class Compile {
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
    let mustach = /\{\{(.+)\}\}/
    if (mustach.test(node.nodeValue)) {
      let key = RegExp.$1
      node.nodeValue = this.vm.$data[key]
    }
  }

  // 编译元素节点
  compileElement(node) {
    let attributes = this.toArray(node.attributes)
    attributes.forEach((attr) => {
      // console.dir(attr)
      let attrName = attr.name
      let expr = attr.value

      if (this.isDirective(attrName)) {
        let directive = attrName.slice(2)

        if (directive === 'text') {
          node.innerText = this.vm.$data[expr]
        }

        if (directive === 'html') {
          node.innerHTML = this.vm.$data[expr]
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

  // 属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
}
