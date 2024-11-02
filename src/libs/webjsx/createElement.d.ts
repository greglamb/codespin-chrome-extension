import { Fragment, VElement } from "./types.js";
/**
 * Implementation of createElement function.
 */
export declare function createElement(type: string | typeof Fragment, props: {
    [key: string]: any;
} | null, ...children: any[]): VElement;
