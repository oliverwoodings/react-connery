var clone = require('lodash.clone')
var React = require('react')
var connerify = require('connerify')

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

  const newProps = hijackProps(node)
  const newChildren = hijackChildren(node.props.children)
  return React.cloneElement(node, newProps, newChildren)
}

function hijackProps (node) {
  const newProps = clone(node.props)
  const { type, value, placeholder } = newProps
  if (node.type === 'input' && type === 'text') {
    if (value) {
      newProps.value = connerify(value)
    }
    if (placeholder) {
      newProps.placeholder = connerify(placeholder)
    }
  }
  return newProps
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

function wrapShtatelesh (node) {
  var WrappedShtatelesh = React.createClass({
    render: function () {
      return node.type(this.props)
    }
  })

  return React.createElement(WrappedShtatelesh, node.props, node.props.children)
}
