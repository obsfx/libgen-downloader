
# libgen-downloader

[![npm version](https://badge.fury.io/js/libgen-downloader.svg)](https://badge.fury.io/js/libgen-downloader)


`libgen-downloader` is a command-line tool for searching and downloading ebooks from **LibGen**. It supports both an interactive terminal UI and a headless CLI mode for automation. Built with `Node.js`, `TypeScript`, `React`, `Ink`, and `Zustand`, it works by visiting LibGen mirror pages, parsing the HTML, and returning results or downloads directly in the terminal.

The current CLI is designed to work well with AI agents and terminal automation tools such as `Claude Code`, `Cowork`, `Codex`, and similar agentic systems. In headless mode it can search, resolve direct download URLs, download single files, run bulk downloads, and emit structured JSON output for downstream tooling.

## Important Update
After the original `libgen` mirrors are blocked and not available anymore (see their status from here https://open-slum.org/), `libgen-downloader` now uses the `libgen+` mirrors as its primary source. You can see the new available mirrors from [configuration](https://github.com/obsfx/libgen-downloader/blob/configuration/config.v3.json).

https://github.com/user-attachments/assets/3d92eb78-1567-478d-a0d1-5724f647be10

https://github.com/user-attachments/assets/9896d457-ccbf-40aa-ae6b-c253f7a97824



## Installation


if you have already installed `NodeJS` and `npm`, you can install it using `npm`:

```
npm i -g libgen-downloader
```

or you can download one of the `standalone executable` versions.

#### [Standalone Executables](https://github.com/obsfx/libgen-downloader/releases)

**macOS users:** After downloading, you need to remove the quarantine attribute and make it executable:
```bash
xattr -c ./libgen-downloader-macos-*
chmod +x ./libgen-downloader-macos-*
```

**Linux users:** Make it executable:
```bash
chmod +x ./libgen-downloader-linux-*
```

## Features

- Interactive terminal UI when launched without flags.
- Headless CLI workflows for AI agents and terminal automation.
- Structured JSON output for machine-readable search and download operations.
- Direct URL resolution for handing downloads off to other tools.
- Single-file and bulk downloads by MD5.
- Extension filtering for search results.
- Quiet mode for lower-noise automation runs.
- Command line parameters;
  ```
  Usage
  	$ libgen-downloader <input>

  Options
  	-s, --search <query>      search for a book (non-interactive output)
  	-b, --bulk <MD5LIST.txt>  download all MD5 entries from a file
  	-u, --url <MD5>           get the direct download URL
  	-d, --download <MD5>      download a single file by MD5
  	-e, --extension <ext>     filter search by extension (e.g. epub,pdf)
  	-o, --output <dir>        output directory for downloaded files
  	-p, --page <number>       search page number (default: 1)
  	-l, --limit <number>      search page size (default: 25)
  	-j, --json                output command result as JSON
  	-q, --quiet               reduce download logs
  	-h, --help                display help

  Examples
  	$ libgen-downloader    (start the app in interactive mode witout flags)
  	$ libgen-downloader -s "The Art of War" -e epub
  	$ libgen-downloader -s "Imagined Communities" -e epub -j
  	$ libgen-downloader -b ./MD5_LIST_1695686580524.txt -o ./downloads
  	$ libgen-downloader -u 1234567890abcdef1234567890abcdef -j
  	$ libgen-downloader -d 1234567890abcdef1234567890abcdef -o ./downloads

  ```

## Agent / Automation Usage

For `Claude Code`, `Cowork`, `Codex`, and other agentic systems, prefer the flag-driven CLI instead of the interactive UI. The `-j, --json` flag returns structured output that is easier for tools and agents to parse reliably.

```bash
# Search for EPUB matches and return JSON
libgen-downloader -s "The Art of War" -e epub -j

# Resolve a direct download URL for an MD5
libgen-downloader -u 1234567890abcdef1234567890abcdef -j

# Download a single file quietly into a target directory
libgen-downloader -d 1234567890abcdef1234567890abcdef -o ./downloads -q

# Download multiple MD5 entries from a file and return a JSON summary
libgen-downloader -b ./MD5_LIST.txt -o ./downloads -j
```



## Changelogs

v3.3.1

- Added a headless CLI flow for agent-driven use cases alongside the interactive terminal UI.
- Added non-interactive commands for search, direct URL resolution, single downloads, and bulk downloads.
- Added structured JSON output for automation and AI agent integrations.
- Added `--quiet` and output directory support to make unattended runs easier to manage.

---

v3.0.0

- Added new `libgen+` mirrors as primary source. App is now usable as long as the `libgen+` mirrors are available.
- Dropped `search by` filtering options to make it compatible with the new `libgen+` mirrors.
- Dropped `alternative downloads` feature to make it compatible with the new `libgen+` mirrors.

---

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
- Due to the https://gen.lib.rus.ec is banned in my country, now libgen-downloader fetches the latest configuration file from the [configuration](https://github.com/obsfx/libgen-downloader/tree/configuration) branch and finds an available mirror dynamically.

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
