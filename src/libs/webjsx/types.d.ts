export declare const Fragment: (props: {
    children?: VNode | VNode[];
}) => VNode[];
export type FragmentType = typeof Fragment;
export type Primitive = string | number | boolean;
export type Ref = ((node: Node | null) => void) | {
    current: Node | null;
};
export interface ElementProps {
    [key: string]: any;
    children?: VNode[];
    key?: string | number;
    dangerouslySetInnerHTML?: {
        __html: string;
    };
}
export interface VElement {
    type: string | FragmentType;
    props: ElementProps;
}
export type VNode = VElement | Primitive;
