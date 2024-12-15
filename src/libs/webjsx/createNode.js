import { SVG_NAMESPACE } from "./constants.js";
import { Fragment } from "./types.js";
import { setAttributes } from "./utils.js";
function isFragment(type) {
    return type === Fragment;
}
export function createNode(vnode, parentNamespaceURI) {
    if (typeof vnode === "string" ||
        typeof vnode === "number" ||
        typeof vnode === "boolean") {
        return document.createTextNode(String(vnode));
    }
    else if (isFragment(vnode.type)) {
        const fragment = document.createDocumentFragment();
        if (vnode.props.children) {
            const children = vnode.props.children;
            children.forEach((child) => {
                fragment.appendChild(createNode(child, undefined));
            });
        }
        return fragment;
    }
    else {
        const namespaceURI = vnode.props.xmlns !== undefined
            ? vnode.props.xmlns
            : vnode.type === "svg"
                ? SVG_NAMESPACE
                : parentNamespaceURI ?? undefined;
        const el = vnode.props.is !== undefined
            ? namespaceURI !== undefined
                ? document.createElementNS(namespaceURI, vnode.type, {
                    is: vnode.props.is,
                })
                : document.createElement(vnode.type, {
                    is: vnode.props.is,
                })
            : namespaceURI !== undefined
                ? document.createElementNS(namespaceURI, vnode.type)
                : document.createElement(vnode.type);
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
            const children = vnode.props.children;
            children.forEach((child) => {
                el.appendChild(createNode(child, namespaceURI));
            });
        }
        return el;
    }
}
/**
 * Assigns a ref to a node.
 * @param node The DOM node.
 * @param ref The ref to assign.
 */
function assignRef(node, ref) {
    const currentRef = node.__webjsx_assignedRef;
    // Only assign the ref if it's different
    if (currentRef !== ref) {
        if (typeof ref === "function") {
            ref(node);
        }
        else if (ref && typeof ref === "object") {
            ref.current = node;
        }
        // Store the assigned ref
        node.__webjsx_assignedRef = ref;
    }
}
//# sourceMappingURL=createNode.js.map