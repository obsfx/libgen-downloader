import meow from "meow";

export const cli = meow(
  `
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
`,
  {
    importMeta: import.meta,
    flags: {
      search: {
        type: "string",
        shortFlag: "s",
      },
      bulk: {
        type: "string",
        shortFlag: "b",
      },
      url: {
        type: "string",
        shortFlag: "u",
      },
      download: {
        type: "string",
        shortFlag: "d",
      },
      extension: {
        type: "string",
        shortFlag: "e",
      },
      output: {
        type: "string",
        shortFlag: "o",
      },
      page: {
        type: "number",
        shortFlag: "p",
      },
      limit: {
        type: "number",
        shortFlag: "l",
      },
      json: {
        type: "boolean",
        shortFlag: "j",
      },
      quiet: {
        type: "boolean",
        shortFlag: "q",
      },
      help: {
        type: "boolean",
        shortFlag: "h",
      },
    },
  }
);
