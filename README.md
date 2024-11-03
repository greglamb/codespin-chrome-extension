# CodeSpin.AI Chat - Chrome Extension 

CodeSpin.AI Chat allows you to use Claude and ChatGPT to edit your local project - using the new File System APIs available on Chrome. 
This extension is not yet available on the Chrome Web Store, so it must be installed manually.

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