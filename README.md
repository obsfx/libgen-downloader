# libgen-downloader

[![npm version](https://badge.fury.io/js/libgen-downloader.svg)](https://badge.fury.io/js/libgen-downloader)

---

`libgen-downloader` is a simple command line tool to search and download ebooks from libgen. It is developed using `NodeJS`, `TypeScript`, `React`, `Ink` and `Zustand`. It does not use a search API. It accesses the web pages like a web browser, parses the HTML response and shows the appropriate output to the user. Depending on the status of libgen servers, you might get a connection error while you are searching, downloading or loading new pages.

<https://github.com/obsfx/libgen-downloader/assets/13767783/8b8a923b-2a34-4ec4-89f8-f671c2bc0dc4>

<https://github.com/obsfx/libgen-downloader/assets/13767783/96a56146-18b3-49af-a50a-b088365e73d5>

# Installation

if you have already installed `NodeJS` and `npm`, you can install it using `npm`:

```
npm i -g libgen-downloader
```

or you can download one of the `standalone executable` versions. _(You can click and execute windows executable but in macOS / Linux you have to run it in your terminal.)_

#### [Standalone Executables](https://github.com/obsfx/libgen-cli-downloader/releases)

# Features

- Interactive user interface.
- Non app blocking direct downloading.
- Bulk downloading.
- Alternative download options.
- Command line parameters;

  ```
  Usage
   $ libgen-downloader <input>

  Options
   -s, --search <query>      search for a book
   -b, --bulk <MD5LIST.txt>  start the app in bulk downloading mode
   -u, --url <MD5>           get the download URL
   -d, --download <MD5>      download the file
   -h, --help                display help

  Examples
   $ libgen-downloader    (start the app in interactive mode witout flags)
   $ libgen-downloader -s "The Art of War"
   $ libgen-downloader -b ./MD5_LIST_1695686580524.txt
   $ libgen-downloader -u 1234567890abcdef1234567890abcdef
   $ libgen-downloader -d 1234567890abcdef1234567890abcdef

  ```

# Changelogs

v2.0.0

- Added alternative downloads.
- Added new download progress indicators.
- Added a cache mechanism to quickly retrieve previously searched results..
- Added new CLI parameter `-s, --search` to search queries directly in the command line.
- Added new shortcut keys to simplify usage:
  - `[J]` and `[K]` to move up and down for vimmers.
  - `[TAB]` to add an entry to the bulk download queue.
  - `[D]` to download an entry directly.
- Dropped result filtering. Instead added `Search by` filtering options to filter in columns like the original libgen search functionality.

---

v1.3.7

- Changed cli module and usage.
- Refactored downloading processes.
- README simplified.

---

v1.3

- Whole app was rewritten using `React`, `Ink` and `Zustand`.
- Added result filtering.
- Now you do not have to wait while downloading files using the `direct download` option.
- New version notifier.
- Due to the <https://gen.lib.rus.ec> is banned in my country, now libgen-downloader fetches the latest configuration file from the [configuration](https://github.com/obsfx/libgen-downloader/tree/configuration) branch and finds an available mirror dynamically.

---

v1.2

- Direct download option added as a cli functionality.

---

v1.1

- New and mostly resizeable UI.

---

v1.0

- Addded bulk downloading
- Improved error handling.
- When a connection error occurs, `libgen-downloader` does not shut down instantly. It tries 5 times to do same request with 3 seconds of delay.
- New customized UI module.
