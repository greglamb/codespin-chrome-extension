import { Fragment } from "./types.js";
export * from "./jsx.js";
export { Fragment };
export declare function jsx(type: any, props: any, key: any): import("./types.js").VElement;
export declare function jsxs(type: any, props: any, key: any): import("./types.js").VElement;
export declare function jsxDEV(type: any, props: any, key: any): import("./types.js").VElement;
export declare const JSXFragment: (props: {
    children?: import("./types.js").VNode | import("./types.js").VNode[];
}) => import("./types.js").VNode[];
