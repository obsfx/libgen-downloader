/**
 * Represents the result of a successful download operation
 */
export interface DownloadResult {
  /**
   * Full path to the downloaded file
   */
  path: string;

  /**
   * Filename of the downloaded file
   */
  filename: string;

  /**
   * Total size of the downloaded file in bytes
   */
  total: number;
}
