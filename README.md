![](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/master/logo.png)



# [libgen-downloader](https://obsfx.github.io/libgen-downloader) [![npm version](https://badge.fury.io/js/libgen-downloader.svg)](https://badge.fury.io/js/libgen-downloader)

![](https://raw.githubusercontent.com/obsfx/libgen-cli-downloader/master/demo.gif)

`libgen-downloader` is a simple command line tool to search and download ebooks from libgen that was developed in `nodejs` with `typescript`. It is not using any API. It basically accesses the web page like a web browser, parses the HTML response and shows the appropriate output to the user. Depending on the status of libgen servers, you might get a connection error while you are searching, downloading or loading new pages.

# installation

if you have already installed `nodejs` and `npm`, you can directly install with `npm`

```
npm i -g libgen-downloader
```

or you can download one of the `standalone executable` versions. *(You can directly click and execute windows executable but in macOS / Linux you have to run in your terminal)*

#### [Standalone Executables](https://github.com/obsfx/libgen-cli-downloader/releases)



# features

```
libgen-downloader --bulk=md5list.txt
```

In addition to single file download option, you can download more than one file sequentially by using `bulk downloading` feature.

[bulk downloading gif here]

`libgen-downloader` does not download files at the same time to avoid breaking the libgen servers or blocking by the libgen servers because of too many requests. So, you have to be patient.

At the end of the bulk downloading, `libgen-downloader` will export a `.txt`that contains MD5 codes of downloaded files line by line. When you want to download all files again you can use this file with this command line parameter that calls as `--bulk`.

[b arg gif here]

if you start `libgen-downloader` with --bulk parameter, `libgen-downloader` tries to read target file line by line to get MD5 codes and directly starts in bulk downloading mode. You can also use your own list file that contains MD5 codes but you must be sure about that all md5 codes listed line by line.



```
libgen-downloader --geturl=md5_code_of_file
```

If you have the MD5 code of file and want to get download URL of file directly, you can use `--geturl` parameter.

[get url gif]



#### v1.0 changelog

- Bulk downloading
- Better error handling.
- When a connection error occurs, `libgen-downloader` does not shut down instantly. It tries 5 times to do same request with 3 seconds of delay.
- Customized UI module.
