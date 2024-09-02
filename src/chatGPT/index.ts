import { showSyncStatusButton, removeSyncOverlayButton } from './syncStatusButton';
import { attachSyncButton } from './syncButton';
import { projectSyncUrls } from './projectSyncUrls';

export function attachCodeSpinLinks() {
  if (projectSyncUrls.has(window.location.href)) {
    showSyncStatusButton();
  } else {
    removeSyncOverlayButton();
  }

  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    if (!(preElement as any).attachedCodeSpinLink) {
      attachSyncButton(preElement as HTMLElement);
      (preElement as any).attachedCodeSpinLink = true;
    }
  });
}

