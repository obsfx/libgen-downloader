import meow from "meow";

export const cli = meow(
  `
	Usage
	  $ libgen-downloader <input>

	Options
    -s, --search <query>      search for a book
    -b, --bulk <MD5LIST.txt>  start the app in bulk downloading mode
    -u, --url <MD5>           get the download URL
    -d, --download <MD5>      download the file
    -h, --help                display help for command

	Examples
    $ libgen-downloader  start the app in interactive mode
    $ libgen-downloader -b ./MD5_LIST_1695686580524.txt  start the app in bulk downloading mode
    $ libgen-downloader -u 1234567890abcdef1234567890abcdef  get the download URL
    $ libgen-downloader -d 1234567890abcdef1234567890abcdef  download the file
`,
  {
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
      help: {
        type: "boolean",
        shortFlag: "h",
      },
    },
  }
);
