import "webjsx";
import { VNode } from "webjsx";

declare module "webjsx" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-sync-icon": {};
      "codespin-icon": {};
      "codespin-sync-button": {};
      "codespin-inbound-button": {};
      "codespin-sync-form": {};
      "codespin-connection": { visible: boolean };
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
