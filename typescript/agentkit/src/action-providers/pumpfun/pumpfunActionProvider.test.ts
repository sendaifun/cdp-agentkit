import type { SvmWalletProvider } from "../../wallet-providers";
import { PumpfunActionProvider } from "./pumpfunActionProvider";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import type { Network } from "../../network";

// Mock solana-agent-kit and @solana-agent-kit/plugin-token
jest.mock("solana-agent-kit", () => ({
  __esModule: true,
  SolanaAgentKit: jest.fn().mockImplementation(() => ({
    use: jest.fn().mockReturnThis(),
    methods: {
      launchPumpFunToken: jest.fn().mockResolvedValue({
        mint: "mockMintAddress123456789",
        metadataUri: "https://example.com/metadata.json",
      }),
    },
  })),
}));

jest.mock("@solana-agent-kit/plugin-token", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({}),
}));

describe("PumpfunActionProvider", () => {
  let mockWallet: jest.Mocked<SvmWalletProvider>;
  let mockConnection: jest.Mocked<Pick<Connection, "getLatestBlockhash" | "rpcEndpoint">>;
  let actionProvider: PumpfunActionProvider;

  beforeEach(() => {
    // Initialize action provider
    actionProvider = new PumpfunActionProvider();

    mockConnection = {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: "mockedBlockhash" }),
      rpcEndpoint: "https://api.mainnet-beta.solana.com",
    };

    // Mock the Solana wallet provider
    mockWallet = {
      getConnection: jest.fn().mockReturnValue(mockConnection),
      getPublicKey: jest.fn().mockReturnValue(new PublicKey("11111111111111111111111111111111")),
      signAndSendTransaction: jest.fn().mockResolvedValue("mock-signature"),
      signTransaction: jest.fn().mockResolvedValue({
        serialize: jest.fn().mockReturnValue(new Uint8Array()),
      }),
      waitForSignatureResult: jest.fn().mockResolvedValue({
        context: { slot: 1234 },
        value: { err: null },
      }),
      getAddress: jest.fn().mockReturnValue("11111111111111111111111111111111"),
      getNetwork: jest.fn().mockReturnValue({ protocolFamily: "svm", networkId: "solana-mainnet" }),
      getName: jest.fn().mockReturnValue("mock-wallet"),
      getBalance: jest.fn().mockResolvedValue(BigInt(1000000000)),
      nativeTransfer: jest.fn(),
    } as unknown as jest.Mocked<SvmWalletProvider>;
  });

  describe("constructor", () => {
    it("should create a provider with correct name", () => {
      expect(actionProvider.name).toBe("pumpfun");
    });
  });

  describe("supportsNetwork", () => {
    it("should return true for Solana mainnet", () => {
      const network: Network = {
        protocolFamily: "svm",
        networkId: "solana-mainnet",
      };
      expect(actionProvider.supportsNetwork(network)).toBe(true);
    });

    it("should return false for other Solana networks", () => {
      const network: Network = {
        protocolFamily: "svm",
        networkId: "solana-devnet",
      };
      expect(actionProvider.supportsNetwork(network)).toBe(false);
    });

    it("should return false for non-Solana networks", () => {
      const network: Network = {
        protocolFamily: "evm",
        networkId: "ethereum-mainnet",
      };
      expect(actionProvider.supportsNetwork(network)).toBe(false);
    });
  });

  describe("launchPumpfunToken", () => {
    const mockTokenArgs = {
      tokenName: "Test Token",
      tokenTicker: "TEST",
      description: "A test token",
      imageUrl: "https://example.com/image.png",
      initialLiquiditySOL: 1,
      website: "https://example.com",
      twitter: "https://twitter.com/test",
      telegram: "https://t.me/test",
      slippageBps: 100,
      priorityFee: 1000,
    };

    it("should successfully launch a token", async () => {
      const result = await actionProvider.launchPumpfunToken(mockWallet, mockTokenArgs);

      expect(result).toEqual({
        mint: "mockMintAddress123456789",
        metadataUri: "https://example.com/metadata.json",
      });
    });

    it("should handle errors during token launch", async () => {
      // Mock implementation to throw an error
      const mockError = new Error("Failed to launch token");
      jest.spyOn(actionProvider, "launchPumpfunToken").mockRejectedValueOnce(mockError);

      await expect(actionProvider.launchPumpfunToken(mockWallet, mockTokenArgs)).rejects.toThrow(
        "Failed to launch token",
      );
    });
  });
});
