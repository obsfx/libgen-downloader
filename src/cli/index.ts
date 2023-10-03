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
    $ libgen-downloader    (start the app in interactive mode witout flags)
    $ libgen-downloader -s "The Art of War"
    $ libgen-downloader -b ./MD5_LIST_1695686580524.txt
    $ libgen-downloader -u 1234567890abcdef1234567890abcdef
    $ libgen-downloader -d 1234567890abcdef1234567890abcdef
`,
  {
    flags: {
      search: {
        type: "string",
        alias: "s",
      },
      bulk: {
        type: "string",
        alias: "b",
      },
      url: {
        type: "string",
        alias: "u",
      },
      download: {
        type: "string",
        alias: "d",
      },
      help: {
        type: "boolean",
        alias: "h",
      },
    },
  }
);
