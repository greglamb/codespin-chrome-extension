export function showPromptDialog(): void {
  const dialogHtml = `
    <dialog id="codespin-dialog" style="width: 400px; background-color: black; color: #ccc; border-radius: 8px; padding: 20px; border: solid #fff;">
      <h3>Prompt Information</h3>
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
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", dialogHtml);

  const dialog = document.getElementById(
    "codespin-dialog"
  ) as HTMLDialogElement;
  dialog.showModal();

  document.getElementById("prompt-ok")!.onclick = () => {
    dialog.close();
    dialog.remove();
  };
}
