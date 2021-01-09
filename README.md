![libgen-downloader](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/gh-pages/media/logo-w.png)

[![npm version](https://badge.fury.io/js/libgen-downloader.svg)](https://badge.fury.io/js/libgen-downloader)

[Source Code](https://github.com/obsfx/libgen-downloader)

---

[`libgen-downloader`](https://github.com/obsfx/libgen-downloader) is a simple command line tool to search and download ebooks from libgen that was developed using NodeJS, TypeScript, React, [Ink](https://github.com/vadimdemedes/ink) and [Zustand](https://github.com/pmndrs/zustand). It is not using a searching API. It basically accesses the web pages like a web browser, parses the HTML response and shows the appropriate output to the user. Depending on the status of libgen servers, you might get a connection error while you are searching, downloading or loading new pages.


![](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/gh-pages/media/a.gif)

# installation

if you have already installed `nodejs` and `npm`, you can directly install with `npm`


```
npm i -g libgen-downloader
```

or you can download one of the `standalone executable` versions. *(You can directly click and execute windows executable but in macOS / Linux you have to run in your terminal)*

[Standalone Executables](https://github.com/obsfx/libgen-cli-downloader/releases)


![](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/gh-pages/media/b.gif)


# parameters

You can directly download a file by passing the `MD5` with `--download` command line parameter.


```
libgen-downloader --download=MD5
```

In addition to single file download option, you can download more than one file sequentially by using `bulk downloading` feature.


```
libgen-downloader --bulk=MD5_list.txt
```

`libgen-downloader` does not download files at the same time to avoid breaking the libgen servers or blocking by the libgen servers because of too many requests. So, you have to be patient.


At the end of the bulk downloading, `libgen-downloader` will export a `.txt` that contains `MD5` codes of downloaded files line by line. When you want to download all files again, you can use this file with command line parameter that calls as `--bulk`.


If you start `libgen-downloader` with `--bulk` parameter, `libgen-downloader` tries to read target file line by line to get `MD5` codes and directly starts in bulk downloading mode. You can also use your own list file that contains `MD5` codes but you must be sure about that all `MD5` codes listed line by line.


If you have the `MD5` code of file and want to get download URL of file directly, you can use `--geturl` parameter.


```
libgen-downloader --geturl=MD5
```

#### v1.3 Changelog

- Whole app was rewritten using React, Ink and Zustand.
- Result filtering.
- Now you do not have to wait while downloading files using the 'direct download' option.
- New version notifier.
- Due to the https://gen.lib.rus.ec is banned in my country, now libgen-downloader fetches the latest configuration file from the [configuration](https://github.com/obsfx/libgen-downloader/tree/configuration) branch and finds an available mirror dynamically.

#### v1.2 Changelog

- Direct download option added as a cli functionality.

#### v1.1 Changelog

- New and mostly resizeable UI.

#### v1.0 Changelog

- Bulk downloading
- Better error handling.
- When a connection error occurs, `libgen-downloader` does not shut down instantly. It tries 5 times to do same request with 3 seconds of delay.
- Customized UI module.
