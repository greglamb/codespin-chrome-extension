import { VNode } from "./types.js";
/**
 * Applies the differences between the new virtual node(s) and the existing DOM.
 * @param parent The parent DOM node where the virtual nodes will be applied.
 * @param newVirtualNode A single virtual node or an array of virtual nodes.
 */
export declare function applyDiff(parent: Node, newVirtualNode: VNode | VNode[]): void;
