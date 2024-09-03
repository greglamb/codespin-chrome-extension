import { attachSyncButton } from './syncButton';
import { showSyncStatusButton } from './syncStatusButton';

export function attachCodeSpinLinks() {
  showSyncStatusButton();
  
  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    if (!(preElement as any).attachedCodeSpinLink) {
      attachSyncButton(preElement as HTMLElement);
      (preElement as any).attachedCodeSpinLink = true;
    }
  });
}

