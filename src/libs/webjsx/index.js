// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/createElement.js
function createElement(type, props, ...children) {
  const normalizedProps = props ? { ...props } : {};
  const flatChildren = [];
  const flatten = (child) => {
    if (Array.isArray(child)) {
      child.forEach(flatten);
    } else if (typeof child === "string" || typeof child === "number") {
      flatChildren.push(child);
    } else if (child === null || child === void 0 || typeof child === "boolean") {
    } else {
      flatChildren.push(child);
    }
  };
  children.forEach(flatten);
  if (flatChildren.length > 0) {
    if (!normalizedProps.dangerouslySetInnerHTML) {
      normalizedProps.children = flatChildren;
    } else {
      console.warn("WebJSX: Ignoring children since dangerouslySetInnerHTML is set.");
    }
  }
  return {
    type,
    props: normalizedProps
  };
}

// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/constants.js
var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/types.js
var Fragment = Symbol("Fragment");

// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/utils.js
function setAttributes(el, props) {
  let isRenderingSuspended = false;
  if (el.__webjsx_suspendRendering) {
    isRenderingSuspended = true;
    el.__webjsx_suspendRendering();
  }
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "key" || key === "dangerouslySetInnerHTML")
      continue;
    if (el instanceof HTMLElement) {
      if (key.startsWith("on") && typeof value === "function") {
        const eventName = key.substring(2).toLowerCase();
        const existingListener = el.__webjsx_listeners?.[eventName];
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
        }
        el.addEventListener(eventName, value);
        el.__webjsx_listeners = {
          ...el.__webjsx_listeners || {},
          [eventName]: value
        };
      } else if (key in el) {
        el[key] = value;
      } else if (typeof value === "string") {
        el.setAttribute(key, value);
      } else {
        el[key] = value;
      }
    } else {
      if (typeof value === "string") {
        el.setAttribute(key, value);
      } else {
        el[key] = value;
      }
    }
  }
  if ("dangerouslySetInnerHTML" in props) {
    const html = props.dangerouslySetInnerHTML.__html || "";
    el.innerHTML = html;
  }
  const currentAttrs = Array.from(el.attributes).map((attr) => attr.name);
  for (const attr of currentAttrs) {
    if (!(attr in props) && !attr.startsWith("on")) {
      el.removeAttribute(attr);
    }
  }
  const oldProps = el.__webjsx_props || {};
  for (const key of Object.keys(oldProps)) {
    if (!(key in props)) {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        const existingListener = el.__webjsx_listeners?.[eventName];
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
          delete el.__webjsx_listeners[eventName];
        }
      } else if (key in el) {
        el[key] = void 0;
      } else {
        el.removeAttribute(key);
      }
    }
  }
  el.__webjsx_props = props;
  if (isRenderingSuspended) {
    el.__webjsx_resumeRendering();
  }
}
function updateAttributes(el, newProps, oldProps) {
  let isRenderingSuspended = false;
  if (el.__webjsx_suspendRendering) {
    isRenderingSuspended = true;
    el.__webjsx_suspendRendering();
  }
  for (const [key, value] of Object.entries(newProps)) {
    if (key === "children" || key === "key" || key === "dangerouslySetInnerHTML")
      continue;
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      const existingListener = el.__webjsx_listeners?.[eventName];
      if (existingListener !== value) {
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
        }
        el.addEventListener(eventName, value);
        el.__webjsx_listeners = {
          ...el.__webjsx_listeners || {},
          [eventName]: value
        };
      }
    } else if (key in el) {
      el[key] = value;
    } else if (typeof value === "string") {
      el.setAttribute(key, value);
    } else {
      el[key] = value;
    }
  }
  if ("dangerouslySetInnerHTML" in newProps) {
    const html = newProps.dangerouslySetInnerHTML.__html || "";
    el.innerHTML = html;
  } else if ("dangerouslySetInnerHTML" in oldProps) {
    el.innerHTML = "";
  }
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps) && key !== "children" && key !== "key" && key !== "dangerouslySetInnerHTML") {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        const existingListener = el.__webjsx_listeners?.[eventName];
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
          delete el.__webjsx_listeners[eventName];
        }
      } else if (key in el) {
        el[key] = void 0;
      } else {
        el.removeAttribute(key);
      }
    }
  }
  el.__webjsx_props = newProps;
  if (isRenderingSuspended) {
    el.__webjsx_resumeRendering();
  }
}

// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/createNode.js
function createNode(vnode, parentNamespaceURI) {
  if (typeof vnode === "string" || typeof vnode === "number" || typeof vnode === "boolean") {
    return document.createTextNode(String(vnode));
  } else if (vnode.type === Fragment) {
    const fragment = document.createDocumentFragment();
    if (vnode.props.children) {
      vnode.props.children.forEach((child) => {
        fragment.appendChild(createNode(child, void 0));
      });
    }
    return fragment;
  } else {
    const namespaceURI = vnode.props.xmlns !== void 0 ? vnode.props.xmlns : vnode.type === "svg" ? SVG_NAMESPACE : parentNamespaceURI ?? void 0;
    const el = vnode.props.is !== void 0 ? namespaceURI !== void 0 ? document.createElementNS(namespaceURI, vnode.type, {
      is: vnode.props.is
    }) : document.createElement(vnode.type, {
      is: vnode.props.is
    }) : namespaceURI !== void 0 ? document.createElementNS(namespaceURI, vnode.type) : document.createElement(vnode.type);
    if (vnode.props) {
      setAttributes(el, vnode.props);
    }
    if (vnode.props.key != null) {
      el.__webjsx_key = vnode.props.key;
      el.setAttribute("data-key", String(vnode.props.key));
    }
    if (vnode.props.ref) {
      assignRef(el, vnode.props.ref);
    }
    if (vnode.props.children && !vnode.props.dangerouslySetInnerHTML) {
      vnode.props.children.forEach((child) => {
        el.appendChild(createNode(child, namespaceURI));
      });
    }
    return el;
  }
}
function assignRef(node, ref) {
  const currentRef = node.__webjsx_assignedRef;
  if (currentRef !== ref) {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && typeof ref === "object") {
      ref.current = node;
    }
    node.__webjsx_assignedRef = ref;
  }
}

// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/applyDiff.js
function applyDiff(parent, newVirtualNode) {
  const newVNodes = Array.isArray(newVirtualNode) ? newVirtualNode : [newVirtualNode];
  diffChildren(parent, newVNodes);
}
function flattenVNodes(vnodes) {
  const flat = [];
  vnodes.forEach((vnode) => {
    if (isFragment(vnode)) {
      flat.push(...vnode.props.children || []);
    } else {
      flat.push(vnode);
    }
  });
  return flat;
}
function isFragment(vnode) {
  return typeof vnode === "object" && vnode !== null && vnode.type === Fragment;
}
function diffChildren(parent, newVNodes) {
  const flattenedVNodes = flattenVNodes(newVNodes);
  const existingNodes = Array.from(parent.childNodes);
  const keyedMap = /* @__PURE__ */ new Map();
  existingNodes.forEach((node) => {
    const key = node.__webjsx_key;
    if (key != null) {
      keyedMap.set(key, node);
    }
  });
  const newKeys = flattenedVNodes.filter(isVElementWithKey).map((vnode) => vnode.props.key);
  existingNodes.forEach((node) => {
    const key = node.__webjsx_key;
    if (key != null && !newKeys.includes(key)) {
      parent.removeChild(node);
    }
  });
  flattenedVNodes.forEach((newVNode, i) => {
    const newKey = isVElement(newVNode) ? newVNode.props.key : void 0;
    let existingNode = null;
    if (newKey != null) {
      existingNode = keyedMap.get(newKey) || null;
    }
    if (!existingNode && newKey == null) {
      existingNode = parent.childNodes[i] || null;
    }
    if (existingNode) {
      if (existingNode !== parent.childNodes[i]) {
        parent.insertBefore(existingNode, parent.childNodes[i] || null);
      }
      updateNode(existingNode, newVNode);
    } else {
      const newDomNode = createNode(newVNode, getNamespaceURI(parent));
      if (isVElement(newVNode) && newVNode.props.key != null) {
        newDomNode.__webjsx_key = newVNode.props.key;
        newDomNode.setAttribute("data-key", String(newVNode.props.key));
      }
      parent.insertBefore(newDomNode, parent.childNodes[i] || null);
    }
  });
  const updatedChildNodes = Array.from(parent.childNodes);
  const newUnkeyed = flattenedVNodes.filter((vnode) => !isVElementWithKey(vnode));
  const existingUnkeyed = updatedChildNodes.filter((node) => !node.__webjsx_key);
  if (newUnkeyed.length < existingUnkeyed.length) {
    for (let i = newUnkeyed.length; i < existingUnkeyed.length; i++) {
      parent.removeChild(existingUnkeyed[i]);
    }
  }
}
function updateNode(domNode, newVNode) {
  if (typeof newVNode === "string" || typeof newVNode === "number" || typeof newVNode === "boolean") {
    if (domNode.nodeType !== Node.TEXT_NODE || domNode.textContent !== String(newVNode)) {
      const newTextNode = document.createTextNode(String(newVNode));
      domNode.parentNode?.replaceChild(newTextNode, domNode);
    }
    return;
  }
  if (newVNode.type === Fragment) {
    if (domNode instanceof DocumentFragment) {
      diffChildren(domNode, newVNode.props.children || []);
    } else {
      const fragment = document.createDocumentFragment();
      if (newVNode.props.children) {
        newVNode.props.children.forEach((child) => {
          fragment.appendChild(createNode(child, void 0));
        });
      }
      domNode.parentNode?.replaceChild(fragment, domNode);
    }
    return;
  }
  if (domNode instanceof HTMLElement && domNode.tagName.toLowerCase() === newVNode.type.toLowerCase()) {
    const oldProps = domNode.__webjsx_props || {};
    const newProps = newVNode.props || {};
    updateAttributes(domNode, newProps, oldProps);
    if (isVElement(newVNode) && newVNode.props.key != null) {
      domNode.__webjsx_key = newVNode.props.key;
      domNode.setAttribute("data-key", String(newVNode.props.key));
    } else {
      delete domNode.__webjsx_key;
      domNode.removeAttribute("data-key");
    }
    if (newProps.ref) {
      assignRef2(domNode, newProps.ref);
    }
    if (!newProps.dangerouslySetInnerHTML && newProps.children != null) {
      diffChildren(domNode, newProps.children);
    }
  } else {
    const newDomNode = createNode(newVNode, domNode.parentNode ? getNamespaceURI(domNode.parentNode) : void 0);
    if (isVElement(newVNode) && newVNode.props.key != null) {
      newDomNode.__webjsx_key = newVNode.props.key;
      newDomNode.setAttribute("data-key", String(newVNode.props.key));
    }
    if (isVElement(newVNode) && newVNode.props.ref) {
      assignRef2(newDomNode, newVNode.props.ref);
    }
    domNode.parentNode?.replaceChild(newDomNode, domNode);
  }
}
function assignRef2(node, ref) {
  const currentRef = node.__webjsx_assignedRef;
  if (currentRef !== ref) {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && typeof ref === "object") {
      ref.current = node;
    }
    node.__webjsx_assignedRef = ref;
  }
}
function isVElement(vnode) {
  return typeof vnode === "object" && vnode !== null && "props" in vnode;
}
function isVElementWithKey(vnode) {
  return isVElement(vnode) && vnode.props.key != null;
}
function getNamespaceURI(node) {
  return node instanceof Element && node.namespaceURI !== HTML_NAMESPACE ? node.namespaceURI ?? void 0 : void 0;
}

// ../../../../../tmp/tmp.k68PfADj48/node_modules/webjsx/dist/jsxTypes.js
var jsxTypes_exports = {};
export {
  Fragment,
  jsxTypes_exports as JSX,
  applyDiff,
  createElement,
  createNode
};
