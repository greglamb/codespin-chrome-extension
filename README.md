# CodeSpin.AI Chrome Extension

This Chrome Extension allows you to use Claude and ChatGPT to edit your local project - using the new File System APIs available on Chrome. 
This extension is not yet available on the Chrome Web Store (it takes weeks for approval), so it must be installed manually. Installation instructions are given below.

## Screenshots

Select Files to include in the prompt:

![image](https://github.com/user-attachments/assets/1e98b3a4-e9ec-4398-8222-8eb80b186e35)

Add files to prompt, and Sync back with your project

![codespin-features](https://github.com/user-attachments/assets/5f2da8cf-76f0-4c69-8234-a19556765cee)

Write it back!

![Screenshot from 2024-11-03 15-47-29](https://github.com/user-attachments/assets/e68dc74c-76ec-4410-9dfa-f6051d2d743a)


## Installation

Clone this project

```sh
git clone https://github.com/codespin-ai/codespin-chrome-extension
```

Switch to the project directory

```sh
cd codespin-chrome-extension
```

Install deps. Note that you need Node.JS.

```sh
npm i
```

Build it.

```sh
./build.sh
```

Now go to Chrome > Extensions > Manage Extensions, and click on "Load Unpacked".
Point it at the `codespin-chrome-extension` directory.

Enjoy.
