import "../../libs/webjsx/index.js";

declare module "../../libs/webjsx/index.js" {
  namespace JSX {
    interface IntrinsicElements {
      "codespin-chatgpt-sync-button": {};
      "codespin-chatgpt-inbound-button": {};
    }
  }
}
