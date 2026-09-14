export function zkArtifactFileNames(nonceRaw?: string): string[];

export function vendorZkArtifacts(options: {
  projectRoot: string;
  env?: NodeJS.ProcessEnv;
}): Promise<string>;
