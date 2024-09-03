import { getProjectSyncUrl, setProjectSyncUrl } from "./projectSyncUrls.js";
import {
  showSyncStatusButton,
  removeSyncOverlayButton,
} from "./syncStatusButton.js";

export function showSyncUrlDialog(): Promise<string | null> {
  const currentUrl = window.location.href;
  const dialogHtml = `
    <dialog id="codespin-dialog" style="width: 400px; height: 500px; background-color: black; color: #ccc; border-radius: 8px; padding: 20px; border: solid #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);">
      <div style="display: flex; border-bottom: 1px solid #fff;">
        <button id="connection-tab" style="flex: 1; padding: 10px; cursor: pointer; background-color: #333; color: #fff; border: none; border-bottom: 3px solid #fff;">Connection</button>
        <button id="prompt-tab" style="flex: 1; padding: 10px; cursor: pointer; background-color: #222; color: #ccc; border: none; border-bottom: 3px solid transparent;">Prompt</button>
        <button id="options-tab" style="flex: 1; padding: 10px; cursor: pointer; background-color: #222; color: #ccc; border: none; border-bottom: 3px solid transparent;">Options</button>
      </div>
      <div id="dialog-content" style="padding-top: 10px;">
        <div id="connection-content">
          <label for="codespin-url">Project sync url:</label><br>
          <input type="text" id="codespin-url" name="codespin-url" style="width: 100%; color: black; margin-top: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;" required value="${
            getProjectSyncUrl(currentUrl) || ""
          }">
          <p style="margin-top: 20px">
            <button id="codespin-submit" style="background-color: green; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
            <button id="codespin-cancel" style="background-color: #f44336; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cancel</button>
          </p>
        </div>
        <div id="prompt-content" style="display: none;">
          <p style="font-weight: bold">Add the following text into your prompt:</p>
          <p style="margin-top: 8px; font-size: 0.9em;">
            When you produce any source code, you must use the following format for each file.
            <br />
            <br />
            File path:./a/b/file.js
            <br />
            -- start a markdown code block for the code --
            <br />
            <br />
            "File path:./a/b/file.js" should not be inside the markdown code block, but just before the start of the code block.
          </p>
          <p style="margin-top: 20px">
            <button id="prompt-ok" style="background-color: green; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </p>
        </div>
        <div id="options-content" style="display: none;">
          <p style="font-weight: bold">Options Tab Content:</p>
          <p style="margin-top: 8px; font-size: 0.9em;">
            Here you can add various options and settings for CodeSpin.
            For example, you could include settings related to code syncing or other preferences.
          </p>
          <p style="margin-top: 20px">
            <button id="options-ok" style="background-color: green; color: white; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
          </p>
        </div>
      </div>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", dialogHtml);

  const dialog = document.getElementById(
    "codespin-dialog"
  ) as HTMLDialogElement;
  dialog.showModal();

  return new Promise<string | null>((resolve) => {
    const connectionTab = document.getElementById(
      "connection-tab"
    ) as HTMLButtonElement;
    const promptTab = document.getElementById(
      "prompt-tab"
    ) as HTMLButtonElement;
    const optionsTab = document.getElementById(
      "options-tab"
    ) as HTMLButtonElement;
    const connectionContent = document.getElementById(
      "connection-content"
    ) as HTMLDivElement;
    const promptContent = document.getElementById(
      "prompt-content"
    ) as HTMLDivElement;
    const optionsContent = document.getElementById(
      "options-content"
    ) as HTMLDivElement;

    const selectTab = (
      selectedTab: HTMLButtonElement,
      otherTabs: HTMLButtonElement[],
      selectedContent: HTMLDivElement,
      otherContents: HTMLDivElement[]
    ) => {
      selectedTab.style.backgroundColor = "#333";
      selectedTab.style.color = "#fff";
      selectedTab.style.borderBottom = "3px solid #fff";

      otherTabs.forEach((tab) => {
        tab.style.backgroundColor = "#222";
        tab.style.color = "#ccc";
        tab.style.borderBottom = "3px solid transparent";
      });

      selectedContent.style.display = "block";
      otherContents.forEach((content) => {
        content.style.display = "none";
      });
    };

    connectionTab.onclick = () => {
      selectTab(connectionTab, [promptTab, optionsTab], connectionContent, [
        promptContent,
        optionsContent,
      ]);
    };

    promptTab.onclick = () => {
      selectTab(promptTab, [connectionTab, optionsTab], promptContent, [
        connectionContent,
        optionsContent,
      ]);
    };

    optionsTab.onclick = () => {
      selectTab(optionsTab, [connectionTab, promptTab], optionsContent, [
        connectionContent,
        promptContent,
      ]);
    };

    document.getElementById("codespin-submit")!.onclick = () => {
      const url = (document.getElementById("codespin-url") as HTMLInputElement)
        .value;
      setProjectSyncUrl(currentUrl, url || null);
      dialog.close();
      dialog.remove();
      if (url) {
        showSyncStatusButton();
      } else {
        removeSyncOverlayButton();
      }
      resolve(url);
    };

    document.getElementById("codespin-cancel")!.onclick = () => {
      dialog.close();
      dialog.remove();
      resolve(null);
    };

    document.getElementById("prompt-ok")!.onclick = () => {
      dialog.close();
      dialog.remove();
      resolve(null);
    };

    document.getElementById("options-ok")!.onclick = () => {
      dialog.close();
      dialog.remove();
      resolve(null);
    };
  });
}
