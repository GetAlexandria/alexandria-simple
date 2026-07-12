import { readFileSync } from "fs";
import { join } from "path";
import {
  acpProviderForConfig,
  DEFAULT_ACP_PROVIDER,
  parseConfig,
  type AcpProvider,
} from "./config.js";
import { CONFIG_FILE_NAME, DEFAULT_CONFIG_DIR } from "./paths.js";
import { isMissingFileError } from "../effects/filesystem.js";

export function readConfiguredAcpProvider(cwd: string): AcpProvider {
  const configPath = join(cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);

  try {
    return acpProviderForConfig(parseConfig(readFileSync(configPath, "utf8")));
  } catch (error) {
    if (isMissingFileError(error)) {
      return DEFAULT_ACP_PROVIDER;
    }

    throw error instanceof Error ? error : new Error(String(error));
  }
}
