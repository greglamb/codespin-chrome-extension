import "webjsx";
import { VNode } from "webjsx";

declare module "webjsx" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-sync-icon": {};
      "codespin-sync-button": {};
      "codespin-sync-form": {};
      "side-drawer": {
        id?: string;
        open?: boolean;
        right?: string;
        children?: VNode | VNode[];
        style?: string;
      };
    }
  }
}
