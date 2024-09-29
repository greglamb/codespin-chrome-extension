import "webjsx";
import { MenuComponentProps } from "./components/Menu.js";
import { SyncUrlDialogProps } from "./components/SyncUrlDialog.js";

declare module "webjsx" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-sync-status-button": {};
      "codespin-sync-button": {};
      "codespin-options-dialog": {};
      "codespin-prompt-dialog": {};
      "codespin-sync-url-dialog": SyncUrlDialogProps;
      "codespin-menu": MenuComponentProps
    }
  }
}
