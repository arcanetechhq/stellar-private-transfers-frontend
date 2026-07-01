export type DepositNetworkOption = {
  id: string;
  label: string;
  icon?: string;
  addresses: {
    usdc: string[];
    xlm: string[];
  };
};

export const DEPOSIT_NETWORK_OPTIONS: DepositNetworkOption[] = [
  {
    id: "base",
    label: "Base",
    addresses: {
      usdc: [
        "0x8E4d6A2b7F3C1D9fA84F0e2B6d7A9c1E5F0bA612",
        "0x41f9C6E0D4a2B8F7c93D1A5e6B0aC8d2F4E71A9C",
      ],
      xlm: [
        "0xbA5e7C2f4d1E9A0c8B6F3e2D5a7C9E1F0b2A468",
        "0x7C1e5B3a9F2d4E8c6A0b1D7f3E5a9C2b4F6A8d0",
      ],
    },
  },
  {
    id: "stellar",
    label: "Stellar",
    icon: "/assets/tokens/xlm.svg",
    addresses: {
      usdc: [
        "GUSDC2KX4KJW6YBZ3M7Q5F3E2VJ9W8N4P6R7T2YH5KQARC",
        "GDUSDC4R9N2X6K8M5V3T1W4C9H6J2L8S5E7A3B1D4ARC",
      ],
      xlm: [
        "GCFX2KX4KJW6YBZ3M7Q5F3E2VJ9W8N4P6R7T2YH5KQ3DARCXLM",
        "GDQ7P4R9N2X6K8M5V3T1W4C9H6J2L8S5E7A3B1D4ARCXLM",
      ],
    },
  },
];

export const PRIVATE_DEPOSIT_ADDRESSES: Record<string, string> = {
  base: "arc1baseprivate7kx4kjw6ybz3m7q5f3e2vj9w8n4p6r7t2",
  stellar: "arc1stellarprivate4r9n2x6k8m5v3t1w4c9h6j2l8s5",
};

export const DEPOSIT_ADDRESS_GENERATION_DELAY_MS = 30_000;
export const PRIVATE_DEPOSIT_ADDRESS_GENERATION_DELAY_MS = 1200;

export const WALLET_DEPOSIT_NETWORK_ID = "stellar";
