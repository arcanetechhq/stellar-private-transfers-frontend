import { FreighterModule } from "@creit-tech/stellar-wallets-kit/modules/freighter";
import { getAddress, requestAccess } from "@stellar/freighter-api";

export class DirectFreighterModule extends FreighterModule {
  async runChecks(): Promise<void> {
    return;
  }

  async getAddress(params: {
    skipRequestAccess?: boolean;
  }): Promise<{ address: string }> {
    if (params?.skipRequestAccess !== true) {
      const access = await requestAccess();
      if (access.error) {
        throw access.error;
      }
    }

    const { address, error } = await getAddress();
    if (error) {
      throw error;
    }
    if (!address) {
      throw {
        code: -3,
        message:
          "Getting the address from Freighter is not allowed, please request access first.",
      };
    }
    return { address };
  }
}
