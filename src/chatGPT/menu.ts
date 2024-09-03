import { showPromptDialog } from "./promptDialog.js";
import { showSyncUrlDialog } from "./syncUrlDialog.js";
import { showOptionsDialog } from "./optionsDialog.js";

export function toggleMenu(
  button: HTMLElement,
  mouseX: number,
  mouseY: number
) {
  const existingMenu = document.getElementById("codespin-menu");
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menuWidth = 160;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const verticalHalf = screenHeight / 2;

  // Calculate initial position
  let leftPosition = mouseX - menuWidth / 2;
  let bottomPosition = screenHeight - mouseY + 20; // Open upwards by default

  // Adjust for right edge of the screen
  if (leftPosition + menuWidth > screenWidth - 20) {
    leftPosition = screenWidth - 20 - menuWidth;
  }

  // Adjust for left edge of the screen
  if (leftPosition < 20) {
    leftPosition = 20;
  }

  // If the cursor is in the top half, open downwards
  if (mouseY < verticalHalf) {
    bottomPosition = screenHeight - mouseY - button.offsetHeight - 20;
  }

  const menuHtml = `
    <div id="codespin-menu" style="position: fixed; left: ${leftPosition}px; bottom: ${bottomPosition}px; width: ${menuWidth}px; background-color: white; color: black; border: 1px solid #ccc; border-radius: 4px; z-index: 1001; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
      <ul style="list-style-type: none; margin: 0; padding: 0;">
        <li style="padding: 8px; cursor: pointer; border-bottom: 1px solid #ccc;" id="codespin-prompt">Prompt</li>
        <li style="padding: 8px; cursor: pointer; border-bottom: 1px solid #ccc;" id="codespin-set-sync-url">Set Sync Url</li>
        <li style="padding: 8px; cursor: pointer;" id="codespin-options">Options</li>
      </ul>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", menuHtml);

  document.getElementById("codespin-prompt")!.onclick = () => {
    showPromptDialog();
    closeMenu();
  };
  document.getElementById("codespin-set-sync-url")!.onclick = () => {
    showSyncUrlDialog();
    closeMenu();
  };
  document.getElementById("codespin-options")!.onclick = () => {
    showOptionsDialog();
    closeMenu();
  };

  function closeMenu() {
    const menu = document.getElementById("codespin-menu");
    if (menu) {
      menu.remove();
    }
  }

  document.addEventListener("click", closeMenu, { once: true });
}
