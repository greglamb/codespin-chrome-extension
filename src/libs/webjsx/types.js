export const Fragment = (props) => {
    return props.children
        ? Array.isArray(props.children)
            ? props.children
            : [props.children]
        : [];
};
//# sourceMappingURL=types.js.map