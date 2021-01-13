# libgen-downloader 

[![npm version](https://badge.fury.io/js/libgen-downloader.svg)](https://badge.fury.io/js/libgen-downloader)

[Source Code](https://github.com/obsfx/libgen-downloader)

---

`libgen-downloader` is a simple command line tool to search and download ebooks from libgen that was developed using `NodeJS`, `TypeScript`, `React`, `Ink` and `Zustand`. It is not using a searching API. It basically accesses the web pages like a web browser, parses the HTML response and shows the appropriate output to the user. Depending on the status of libgen servers, you might get a connection error while you are searching, downloading or loading new pages.



![](https://raw.githubusercontent.com/obsfx/libgen-downloader/gh-pages/media/demo.gif)



# installation

if you have already installed `NodeJS` and `npm`, you can directly install with `npm`

```
npm i -g libgen-downloader
```

or you can download one of the `standalone executable` versions. *(You can directly click and execute windows executable but in macOS / Linux you have to run it in your terminal)*

#### [Standalone Executables](https://github.com/obsfx/libgen-cli-downloader/releases)



# features

- Interactive user Interface.
- Non app blocking direct downloading.
- Bulk downloading.
- Command line parameters;
  ```
  Usage: libgen-downloader [options]
  
  Options:
    -b, --bulk <MD5LIST.txt>  start the app in bulk downloading mode
    -u, --url <MD5>           get the download URL
    -d, --download <MD5>      download the file
    -h, --help                display help for command
  ```



# Changelogs

v1.3.7

- Changed cli module and usage.
- Refactored downloading processes.
- README simplified.

---

v1.3

- Whole app was rewritten using `React`, `Ink` and `Zustand`.
- Result filtering.
- Now you do not have to wait while downloading files using the `direct download` option.
- New version notifier.
- Due to the https://gen.lib.rus.ec is banned in my country, now libgen-downloader fetches the latest configuration file from the [configuration](https://github.com/obsfx/libgen-downloader/tree/configuration) branch and finds an available mirror dynamically.

---

v1.2

- Direct download option added as a cli functionality.

---

v1.1

- New and mostly resizeable UI.

---

v1.0

- Bulk downloading
- Better error handling.
- When a connection error occurs, `libgen-downloader` does not shut down instantly. It tries 5 times to do same request with 3 seconds of delay.
- Customized UI module.
