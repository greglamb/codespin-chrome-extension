/**
 * Sets attributes and properties on a DOM element based on the provided props.
 * If the property exists on the element, it sets it as a property.
 * Otherwise, it sets it as an attribute or property based on the value type.
 *
 * @param el - The DOM element to update.
 * @param props - The new properties to apply.
 */
export declare function setAttributes(el: Element, props: {
    [key: string]: any;
}): void;
/**
 * Updates attributes and properties on a DOM element based on the new and old props.
 *
 * @param el - The DOM element to update.
 * @param newProps - The new properties to apply.
 * @param oldProps - The old properties to compare against.
 */
export declare function updateAttributes(el: HTMLElement, newProps: {
    [key: string]: any;
}, oldProps: {
    [key: string]: any;
}): void;
