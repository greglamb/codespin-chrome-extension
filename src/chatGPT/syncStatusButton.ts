import { showSyncUrlDialog } from "./syncUrlDialog.js";

let buttonPosition = {
  left: "auto",
  top: "auto",
  bottom: "20px",
  right: "20px",
};

let wasDragged = false;
let useSmallOverlay = false;  // Memory for overlay size, persists until page refresh
let buttonBgColor = "green";  // Memory for button background color

export function setOverlaySize(smallOverlay: boolean) {
  useSmallOverlay = smallOverlay;
  updateSyncStatusButton();
}

export function setButtonBgColor(color: string) {
  buttonBgColor = color || "green";
  updateSyncStatusButton();
}

// Getter functions to retrieve the current values
export function getOverlaySize(): boolean {
  return useSmallOverlay;
}

export function getButtonBgColor(): string {
  return buttonBgColor;
}

function updateSyncStatusButton() {
  removeSyncOverlayButton(); // Remove existing button to update size and color
  showSyncStatusButton();    // Recreate the button with the new size and color
}

export function showSyncStatusButton() {
  let overlayButton = document.getElementById("codespin-overlay-button");

  if (!overlayButton) {
    const buttonText = useSmallOverlay ? "Sync" : "CodeSpin Syncing";
    const buttonSizeStyle = useSmallOverlay ? "padding: 2px 8px; font-size: 0.7em;" : "padding: 4px 16px; font-size: 0.9em;";
    const buttonHtml = `
      <button id="codespin-overlay-button" style="position: fixed; bottom: ${buttonPosition.bottom}; left: ${buttonPosition.left}; right: ${buttonPosition.right}; top: ${buttonPosition.top}; background-color: ${buttonBgColor}; color: white; ${buttonSizeStyle} border: none; border-radius: 20px; cursor: pointer; z-index: 1000;">
        ${buttonText}
      </button>
    `;
    document.body.insertAdjacentHTML("beforeend", buttonHtml);

    overlayButton = document.getElementById("codespin-overlay-button");

    overlayButton!.onclick = () => {
      if (!wasDragged) {
        showSyncUrlDialog();
      }
      wasDragged = false;
    };

    makeButtonDraggable(overlayButton!);
  }
}

export function removeSyncOverlayButton() {
  const overlayButton = document.getElementById("codespin-overlay-button");
  if (overlayButton) {
    overlayButton.remove();
  }
}

function makeButtonDraggable(button: HTMLElement) {
  let offsetX: number;
  let offsetY: number;
  let isDragging = false;
  let initialX: number;
  let initialY: number;

  button.addEventListener("mousedown", (e) => {
    isDragging = true;
    initialX = e.clientX;
    initialY = e.clientY;
    offsetX = e.clientX - button.getBoundingClientRect().left;
    offsetY = e.clientY - button.getBoundingClientRect().top;
    button.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        wasDragged = true;
      }

      button.style.left = `${e.clientX - offsetX}px`;
      button.style.top = `${e.clientY - offsetY}px`;
      button.style.bottom = "auto";
      button.style.right = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      button.style.cursor = "pointer";

      buttonPosition.left = button.style.left;
      buttonPosition.top = button.style.top;
      buttonPosition.bottom = button.style.bottom;
      buttonPosition.right = button.style.right;
    }
  });
}
