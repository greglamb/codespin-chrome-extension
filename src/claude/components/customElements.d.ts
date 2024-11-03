import "../../libs/webjsx/index.js";

declare module "../../libs/webjsx/index.js" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-claude-sync-button": { style?: string };
      "codespin-claude-inbound-button": {};
    }
  }
}
