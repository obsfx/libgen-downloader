![](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/master/logo.png)

## V1.0 TODOs

- [ ] Puntonite `(new ui module)`
  - [x] Rendering
  - [x] Event Handler
  - [ ] Single Input
  - [x] List Output
  - [ ] Listing Submenu
  - [ ] Checkable Listings for Bulk Downloading
  - [ ] Bulk Downloading Listing
  - [ ] Remove Inquirer Dependency
  
- [ ] Bulk Downloading
  - [ ] Downloading by a given md5.txt file
  - [ ] Downloading by selecting  listings from in-app list
  - [ ] Export md5 codes of selected and downloaded listings



# [libgen-downloader](https://obsfx.github.io/libgen-downloader) [![npm version](https://badge.fury.io/js/libgen-downloader.svg)](https://badge.fury.io/js/libgen-downloader)

![](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/master/demo.gif)

`libgen-downloader` is a simple command line tool to search and download ebooks from libgen that was developed in `nodejs` with `typescript`. It is not using any API. It basically accesses the web page like a web browser, parses the HTML response and shows the appropriate output to the user. Depending on the status of libgen servers, you might get a connection error while you are searching, downloading or loading new pages.

# Installation

if you have already installed `nodejs` and `npm`, you can directly install with `npm`

```
npm i -g libgen-downloader
```

or you can download one of the `standalone executable` versions. *(You can directly click and execute windows executable but in macOS / Linux you have to run in your terminal)*

#### [Standalone Executables](https://github.com/obsfx/libgen-cli-downloader/releases)

