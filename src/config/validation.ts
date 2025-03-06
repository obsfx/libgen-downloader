interface LibgenConfig {
  mirror: string;
  downloadMirrors: string[];
  searchByMD5Pattern: string;
  [key: string]: any;
}

/**
 * Validates a libgen config object
 * @param config The config to validate
 * @returns The validation result with any errors
 */
export function validateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config) {
    return { valid: false, errors: ['Config is missing or null'] };
  }

  // Check required fields
  if (!config.mirror) {
    errors.push('Mirror URL is missing from config');
  } else if (typeof config.mirror !== 'string' || !config.mirror.startsWith('http')) {
    errors.push('Mirror URL is invalid');
  }

  if (!Array.isArray(config.downloadMirrors) || config.downloadMirrors.length === 0) {
    errors.push('Download mirrors are missing or empty');
  } else {
    // Validate each mirror URL
    config.downloadMirrors.forEach((mirror: any, index: number) => {
      if (typeof mirror !== 'string' || !mirror.startsWith('http')) {
        errors.push(`Download mirror at index ${index} is invalid`);
      }
    });
  }

  if (!config.searchByMD5Pattern) {
    errors.push('MD5 search pattern is missing');
  } else if (typeof config.searchByMD5Pattern !== 'string' || !config.searchByMD5Pattern.includes('{md5}')) {
    errors.push('MD5 search pattern is invalid (must contain {md5} placeholder)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Apply default config values where missing
 * @param config Partial config object
 * @returns Complete config with defaults applied
 */
export function applyConfigDefaults(config: Partial<LibgenConfig>): LibgenConfig {
  return {
    mirror: config.mirror || 'https://libgen.is',
    downloadMirrors: config.downloadMirrors || ['https://library.lol', 'https://libgen.lc'],
    searchByMD5Pattern: config.searchByMD5Pattern || '{mirror}/md5/{md5}',
    ...config
  };
}
