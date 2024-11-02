import "../libs/webjsx/index.js";
import { VNode } from "../libs/webjsx/index.js";
import { FileContentViewer } from "./components/FileContentViewer.js";
import { FileEdits } from "./components/FileEdits.js";
import { FileWriter } from "./components/FileWriter.js";
import { ChangeTree } from "./components/ChangeTree.js";

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
        showSelector?: boolean;
        onfilechange?: (event: {
          detail: string;
          target: FileContentViewer;
        }) => void;
        onmount?: (event: CustomEvent) => void;
      };
      "codespin-file-edits": {
        ref?: (el: FileEdits) => void;
      };
      "codespin-change-tree": {
        ref?: (el: ChangeTree) => void;
        onselect?: (event: CustomEvent<string[]>) => void;
      };
      "codespin-file-writer": {
        onwritten?: (event: Event) => void;
        oncancel?: (event: Event) => void;
      };
    }
  }
}
