module.exports = hijack

function hijack (node) {
  if (typeof node === 'string') {
    return connerify(node)
  } else if (!node) {
    return node
  } else if (typeof node.type !== 'string') {
    if (!node.type.prototype.render) {
      node = wrapShtatelesh(node)
    }
    wrapRender(node.type)
  }

  const newChildren = hijackChildren(node.props.children)
  return React.cloneElement(node, node.props, newChildren)
}

function hijackChildren (children) {
  if (children instanceof Array) {
    return React.Children.map(children, hijack)
  } else if (children) {
    return hijack(children)
  }
}

function wrapRender (type) {
  const proto = type.prototype
  if (proto._oldRender) {
    return
  }

  proto._oldRender = proto.render
  proto.render = function () {
    return hijack(this._oldRender.apply(this, arguments))
  }
}

function connerify (word) {
  return word
    .replace(/(s)([^\ssh])/gi, '$1h$2')
    .replace(/(x)([^\ss])/gi, '$1sh$2')
    .replace(/nce/gi, 'nsh')
}

function wrapShtatelesh (node) {
  class WrappedShtatelesh extends React.Component {
    render () {
      return node.type(this.props)
    }
  }

  return <WrappedShtatelesh {...node.props} />
}
