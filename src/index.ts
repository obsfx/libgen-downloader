import { cli } from "./cli/index";
import { operate } from "./cli/operate";
import { version } from "../package.json";

export const APP_VERSION = version;

// Main function with error handling
async function main() {
  try {
    await operate(cli.flags);
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Start the application
main();
