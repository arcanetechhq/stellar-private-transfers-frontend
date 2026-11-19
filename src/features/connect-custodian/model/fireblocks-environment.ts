export const SANDBOX_ENVIRONMENT_ID = "sandbox";
export const STAND_ENVIRONMENT_ID = "stand";

export type FireblocksEnvironmentId =
  | typeof SANDBOX_ENVIRONMENT_ID
  | typeof STAND_ENVIRONMENT_ID;

export type FireblocksEnvironment = {
  id: FireblocksEnvironmentId;
  baseUrl: string;
};

export const SANDBOX_FIREBLOCKS_BASE_URL = "https://sandbox-api.fireblocks.io/v1";
export const STAND_FIREBLOCKS_BASE_URL = "/api/fireblocks/v1";

export const SANDBOX_FIREBLOCKS_ENVIRONMENT: FireblocksEnvironment = {
  id: SANDBOX_ENVIRONMENT_ID,
  baseUrl: SANDBOX_FIREBLOCKS_BASE_URL,
};

export const STAND_FIREBLOCKS_ENVIRONMENT: FireblocksEnvironment = {
  id: STAND_ENVIRONMENT_ID,
  baseUrl: STAND_FIREBLOCKS_BASE_URL,
};

export const FIREBLOCKS_ENVIRONMENTS: readonly FireblocksEnvironment[] = [
  SANDBOX_FIREBLOCKS_ENVIRONMENT,
  STAND_FIREBLOCKS_ENVIRONMENT,
];

export function fireblocksEnvironmentFor(
  environmentId: FireblocksEnvironmentId,
): FireblocksEnvironment {
  const match = FIREBLOCKS_ENVIRONMENTS.find(
    (environment) => environment.id === environmentId,
  );
  return match ?? SANDBOX_FIREBLOCKS_ENVIRONMENT;
}
