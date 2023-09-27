import meow from "meow";

export const cli = meow(
  `
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`,
  {
    importMeta: import.meta,
    flags: {
      rainbow: {
        type: "boolean",
        shortFlag: "r",
      },
    },
  }
);
