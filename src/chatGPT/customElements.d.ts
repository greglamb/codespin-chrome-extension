import "../libs/webjsx/index.js";
import { VNode } from "../libs/webjsx/index.js";

declare module "../libs/webjsx/index.js" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-sync-icon": {};
      "codespin-icon": {};
      "codespin-sync-button": {};
      "codespin-inbound-button": {};
      "codespin-modal-dialog": {
        ref?: (el: HTMLElement) => void;
        resolve?: () => void;
        children: VNode | VNode[];
      };
      "codespin-modal-message": {
        resolve?: () => void;
        children: VNode | VNode[];
      };
      "codespin-file-importer": {
        onselect?: (event: CustomEvent<string[]>) => void;
        oncancel?: (event: Event) => void;
      };
      "codespin-file-tree": {
        onselect?: (event: CustomEvent<string[]>) => void;
        oncancel?: (event: Event) => void;
      };
      "codespin-file-content-viewer": {
        style?: string;
        class?: string;
        onfilechange?: Function;
      };
    }
  }
}
