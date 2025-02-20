import { Connection, PublicKey } from "@solana/web3.js";
import { SvmWalletProvider } from "../../wallet-providers/svmWalletProvider";
import { MetaplexActionProvider } from "./metaplexActionProvider";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner } from "@metaplex-foundation/umi";

// Mock the @solana/web3.js module
jest.mock("@solana/web3.js", () => ({
  ...jest.requireActual("@solana/web3.js"),
  Connection: jest.fn(),
  PublicKey: jest.fn().mockImplementation((key) => ({ toBase58: () => key })),
}));

// Mock the Metaplex UMI modules
jest.mock("@metaplex-foundation/umi-bundle-defaults", () => ({
  createUmi: jest.fn().mockReturnValue({
    use: jest.fn().mockReturnThis(),
  }),
}));

jest.mock("@metaplex-foundation/umi", () => ({
  generateSigner: jest.fn().mockReturnValue({
    publicKey: "mock-collection-address",
  }),
}));

jest.mock("@metaplex-foundation/mpl-core", () => ({
  createCollection: jest.fn().mockReturnValue({
    buildAndSign: jest.fn().mockResolvedValue({ mockTransaction: true }),
  }),
  mplCore: jest.fn(),
  ruleSet: jest.fn().mockReturnValue("None"),
}));

jest.mock("@metaplex-foundation/umi-web3js-adapters", () => ({
  toWeb3JsTransaction: jest.fn().mockReturnValue({ mockTransaction: true }),
  toWeb3JsPublicKey: jest.fn().mockReturnValue("mock-collection-address"),
}));

// Mock the custom wallet provider
jest.mock("../../wallet-providers/svmWalletProvider");

describe("MetaplexActionProvider", () => {
  let actionProvider: MetaplexActionProvider;
  let mockWallet: jest.Mocked<SvmWalletProvider>;
  let mockConnection: jest.Mocked<Connection>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize the action provider
    actionProvider = new MetaplexActionProvider();

    // Mock the Solana connection
    mockConnection = {
      rpcEndpoint: "mock-endpoint",
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: "mockedBlockhash" }),
    } as unknown as jest.Mocked<Connection>;

    // Mock the wallet provider
    mockWallet = {
      getConnection: jest.fn().mockReturnValue(mockConnection),
      getPublicKey: jest.fn().mockReturnValue(new PublicKey("11111111111111111111111111111111")),
      signAndSendTransaction: jest.fn().mockResolvedValue("mock-signature"),
      waitForSignatureResult: jest.fn().mockResolvedValue({
        context: { slot: 1234 },
        value: { err: null },
      }),
      getAddress: jest.fn().mockReturnValue("11111111111111111111111111111111"),
      getNetwork: jest.fn().mockReturnValue({ protocolFamily: "svm", networkId: "solana-mainnet" }),
      getName: jest.fn().mockReturnValue("mock-wallet"),
    } as unknown as jest.Mocked<SvmWalletProvider>;
  });

  describe("deployCollection", () => {
    const deployArgs = {
      name: "Test Collection",
      uri: "https://example.com/metadata.json",
      royaltyBasisPoints: 500,
    };

    it("should successfully deploy a collection", async () => {
      const result = await actionProvider.deployCollection(mockWallet, deployArgs);

      expect(createUmi).toHaveBeenCalledWith("mock-endpoint");
      expect(mockWallet.signAndSendTransaction).toHaveBeenCalled();
      expect(mockWallet.waitForSignatureResult).toHaveBeenCalledWith("mock-signature");
      expect(result).toContain("Collection deployed successfully!");
      expect(result).toContain("mock-collection-address");
    });

    it("should handle deployment errors", async () => {
      mockWallet.signAndSendTransaction.mockRejectedValueOnce(new Error("Deployment failed"));

      await expect(actionProvider.deployCollection(mockWallet, deployArgs)).rejects.toThrow(
        "Collection deployment failed: Deployment failed"
      );
    });

    it("should use default royalty basis points if not provided", async () => {
      const argsWithoutRoyalty = {
        name: "Test Collection",
        uri: "https://example.com/metadata.json",
      };

      const result = await actionProvider.deployCollection(mockWallet, argsWithoutRoyalty);

      expect(result).toContain("Collection deployed successfully!");
    });
  });

  describe("supportsNetwork", () => {
    test.each([
      [{ protocolFamily: "svm", networkId: "solana-mainnet" }, true, "solana mainnet"],
      [{ protocolFamily: "svm", networkId: "solana-devnet" }, false, "solana devnet"],
      [{ protocolFamily: "evm", networkId: "ethereum-mainnet" }, false, "ethereum mainnet"],
      [{ protocolFamily: "evm", networkId: "solana-mainnet" }, false, "wrong protocol family"],
      [{ protocolFamily: "svm", networkId: "ethereum-mainnet" }, false, "wrong network id"],
    ])("should return %p for %s", (network, expected) => {
      expect(actionProvider.supportsNetwork(network)).toBe(expected);
    });
  });
});
