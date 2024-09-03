import { getProjectSyncUrl, setProjectSyncUrl } from "./projectSyncUrls.js";
import { showSyncStatusButton, removeSyncOverlayButton } from "./syncStatusButton.js";

export function showSyncUrlDialog(): Promise<string | null> {
  const currentUrl = window.location.href;
  const currentSyncUrl = getProjectSyncUrl(currentUrl) || "";

  const dialogHtml = `
    <dialog id="codespin-dialog" style="width: 400px; background-color: black; color: #ccc; border-radius: 8px; padding: 20px; border: solid #fff;">
      <h3>Set Sync URL</h3>
      <label for="codespin-url">Project sync url:</label><br>
      <input type="text" id="codespin-url" name="codespin-url" style="width: 100%; color: black; margin-top: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;" required value="${currentSyncUrl}">
      <p style="margin-top: 20px">
        <button id="codespin-submit" style="background-color: green; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
        <button id="codespin-cancel" style="background-color: #f44336; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cancel</button>
      </p>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", dialogHtml);

  const dialog = document.getElementById("codespin-dialog") as HTMLDialogElement;
  dialog.showModal();

  return new Promise<string | null>((resolve) => {
    document.getElementById("codespin-submit")!.onclick = () => {
      const url = (document.getElementById("codespin-url") as HTMLInputElement).value;
      setProjectSyncUrl(currentUrl, url || null);
      if (url) {
        showSyncStatusButton();
      } else {
        removeSyncOverlayButton();
      }
      dialog.close();
      dialog.remove();
      resolve(url);
    };

    document.getElementById("codespin-cancel")!.onclick = () => {
      dialog.close();
      dialog.remove();
      resolve(null);
    };
  });
}
