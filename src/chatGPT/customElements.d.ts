import "webjsx";

declare namespace JSX {
  interface IntrinsicElements {
    "codespin-sync-status-button": {};
    "codespin-sync-button": {};
    "codespin-options-dialog": {};
    "codespin-prompt-dialog": {};
    "codespin-sync-url-dialog": {
      currentSyncUrl?: string;
    };
    "codespin-menu": {
      left?: number;
      bottom?: number;
    };
  }
}
