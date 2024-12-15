export function createElement(type, props, ...children) {
    const normalizedProps = props ? { ...props } : {};
    const flatChildren = [];
    const flatten = (child) => {
        if (Array.isArray(child)) {
            child.forEach(flatten);
        }
        else if (typeof child === "string" || typeof child === "number") {
            flatChildren.push(child);
        }
        else if (child === null ||
            child === undefined ||
            typeof child === "boolean") {
            // Ignore null or undefined children
        }
        else {
            flatChildren.push(child);
        }
    };
    children.forEach(flatten);
    if (flatChildren.length > 0) {
        // Only set children if dangerouslySetInnerHTML is not present
        if (!normalizedProps.dangerouslySetInnerHTML) {
            normalizedProps.children = flatChildren;
        }
        else {
            console.warn("WebJSX: Ignoring children since dangerouslySetInnerHTML is set.");
        }
    }
    return {
        type,
        props: normalizedProps,
    };
}
//# sourceMappingURL=createElement.js.map