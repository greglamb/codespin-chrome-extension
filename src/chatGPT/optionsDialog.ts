import {
  setOverlaySize,
  setButtonBgColor,
  getOverlaySize,
  getButtonBgColor,
} from "./syncStatusButton.js";

export function showOptionsDialog(): void {
  const useSmallOverlay = getOverlaySize();
  const buttonColor = getButtonBgColor();

  const dialogHtml = `
    <dialog id="codespin-dialog" style="width: 400px; background-color: black; color: #ccc; border-radius: 8px; padding: 20px; border: solid #fff;">
      <h3>Options</h3>
      <div style="margin-top: 20px;">
        <label>
          <input type="checkbox" id="use-small-overlay" style="margin-right: 8px;" ${
            useSmallOverlay ? "checked" : ""
          }>
          Use small overlay
        </label>
      </div>
      <div style="margin-top: 20px;">
        <label for="bg-color-input">Sync Button Background Color:</label><br>
        <input type="text" id="bg-color-input" name="bg-color-input" style="width: 100%; color: black; margin-top: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;" value="${buttonColor}">
      </div>
      <p style="margin-top: 20px">
        <button id="options-ok" style="background-color: green; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer;">OK</button>
      </p>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", dialogHtml);

  const dialog = document.getElementById(
    "codespin-dialog"
  ) as HTMLDialogElement;
  dialog.showModal();

  document.getElementById("options-ok")!.onclick = () => {
    const smallOverlay = (
      document.getElementById("use-small-overlay") as HTMLInputElement
    ).checked;
    const color =
      (document.getElementById("bg-color-input") as HTMLInputElement).value ||
      "green";
    setOverlaySize(smallOverlay);
    setButtonBgColor(color);
    dialog.close();
    dialog.remove();
  };
}
