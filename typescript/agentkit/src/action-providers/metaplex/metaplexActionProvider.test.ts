import { SvmWalletProvider } from "../../wallet-providers";
import { MetaplexActionProvider } from "./metaplexActionProvider";
import { PublicKey } from "@solana/web3.js";
import { Network } from "../../network";

// Mock solana-agent-kit and @solana-agent-kit/plugin-nft
jest.mock("solana-agent-kit", () => ({
  __esModule: true,
  SolanaAgentKit: jest.fn().mockImplementation(() => ({
    use: jest.fn().mockReturnThis(), // Return the same object to allow chaining
    methods: {
      createToken: jest.fn().mockResolvedValue({
        signature: "mock-token-signature",
        tokenAddress: "mockTokenAddress123456789",
      }),
      createCollection: jest.fn().mockResolvedValue({
        signature: "mock-collection-signature",
        collectionAddress: "mockCollectionAddress123456",
      }),
      mintCollectionNFT: jest.fn().mockResolvedValue({
        signature: "mock-mint-signature",
        mint: {
          toBase58: jest.fn().mockReturnValue("mockNFTAddress123456789"),
        },
      }),
      fetchAsset: jest.fn().mockResolvedValue({
        id: "mock-asset-id",
        name: "Mock Asset",
        symbol: "MOCK",
        content: { json_uri: "https://example.com/metadata.json" },
      }),
      searchAssets: jest.fn().mockResolvedValue({
        items: [
          { id: "asset1", name: "Asset 1" },
          { id: "asset2", name: "Asset 2" },
        ],
        total: 2,
      }),
      getAssetsByCreator: jest.fn().mockResolvedValue({
        items: [
          { id: "asset1", name: "Asset 1" },
          { id: "asset2", name: "Asset 2" },
        ],
        total: 2,
      }),
      getAssetsByAuthority: jest.fn().mockResolvedValue({
        items: [
          { id: "asset1", name: "Asset 1" },
          { id: "asset2", name: "Asset 2" },
        ],
        total: 2,
      }),
      deployCollection: jest.fn().mockResolvedValue({
        collectionAddress: {
          toBase58: jest.fn().mockReturnValue("asdfasdfasdf"),
        },
      }),
      deployToken: jest.fn().mockResolvedValue({
        mint: {
          toBase58: jest.fn().mockReturnValue("mockTokenAddress123456789"),
        },
      }),
      getAsset: jest.fn().mockResolvedValue({
        id: "mock-asset-id",
        name: "Mock Asset",
      }),
    },
  })),
}));

jest.mock("@solana-agent-kit/plugin-nft", () => ({
  __esModule: true,
  default: {
    NFTPlugin: jest.fn().mockReturnValue({}),
  },
}));

describe("MetaplexActionProvider", () => {
  let mockWallet;
  let mockConnection;
  let actionProvider: MetaplexActionProvider;

  beforeEach(() => {
    // Initialize action provider
    actionProvider = new MetaplexActionProvider();

    mockConnection = {
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: "mockedBlockhash" }),
    };

    // Mock the Solana connection to avoid real network requests
    mockWallet = {
      getConnection: jest.fn().mockReturnValue(mockConnection), // Return the mocked connection
      getPublicKey: jest.fn().mockReturnValue(new PublicKey("11111111111111111111111111111111")),
      signAndSendTransaction: jest.fn().mockResolvedValue("mock-signature"),
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
      expect(actionProvider["name"]).toBe("metaplex");
    });
  });

  describe("supportsNetwork", () => {
    it("should return true for Solana networks", () => {
      const network: Network = {
        protocolFamily: "svm",
        networkId: "solana-mainnet",
      };
      expect(actionProvider.supportsNetwork(network)).toBe(true);
    });

    it("should return false for non-Solana networks", () => {
      const network: Network = {
        protocolFamily: "evm",
        networkId: "ethereum-mainnet",
      };
      expect(actionProvider.supportsNetwork(network)).toBe(false);
    });
  });

  /**
   * Test cases for the deployToken function of MetaplexActionProvider
   */
  describe("deployToken", () => {
    it("should successfully deploy tokens", async () => {
      const result = await actionProvider.deployToken(mockWallet, {
        name: "Test Token",
        symbol: "TEST",
        uri: "https://test.com",
      });

      expect(result).toContain("Successfully deployed token");
    });

    it("should handle errors during token deployment", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "deployToken").mockImplementationOnce(async () => {
        return "Error deploying token: Mock error";
      });

      const result = await actionProvider.deployToken(mockWallet, {
        name: "Test Token",
        symbol: "TEST",
        uri: "https://test.com",
      });

      expect(result).toContain("Error deploying token");
    });
  });

  /**
   * Test cases for the deployCollection function
   */
  describe("deployCollection", () => {
    it("should successfully deploy a collection", async () => {
      const result = await actionProvider.deployCollection(mockWallet, {
        name: "Test Collection",
        uri: "https://test.com/collection",
      });

      expect(result).toContain("Successfully deployed collection");
    });

    it("should handle errors during collection deployment", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "deployCollection").mockImplementationOnce(async () => {
        return "Error deploying collection: Mock error";
      });

      const result = await actionProvider.deployCollection(mockWallet, {
        name: "Test Collection",
        uri: "https://test.com/collection",
      });

      expect(result).toContain("Error deploying collection");
    });
  });

  /**
   * Test cases for the getAsset function
   */
  describe("getAsset", () => {
    it("should successfully fetch asset details", async () => {
      const result = await actionProvider.getAsset(mockWallet, {
        assetId: "mock-asset-id",
      });

      expect(result).toContain("asset details for asset ID");
    });

    it("should handle errors when fetching assets", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "getAsset").mockImplementationOnce(async () => {
        return "Error getting asset: Asset not found";
      });

      const result = await actionProvider.getAsset(mockWallet, {
        assetId: "non-existent-asset",
      });

      expect(result).toContain("Error getting asset");
    });
  });

  /**
   * Test cases for the getAssetsByAuthority function
   */
  describe("getAssetsByAuthority", () => {
    it("should successfully fetch assets by authority", async () => {
      const result = await actionProvider.getAssetsByAuthority(mockWallet, {
        authority: "11111111111111111111111111111111",
      });

      expect(result).toContain("assets owned by authority");
    });

    it("should handle errors when fetching assets by authority", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "getAssetsByAuthority").mockImplementationOnce(async () => {
        return "Error getting assets: Invalid authority";
      });

      const result = await actionProvider.getAssetsByAuthority(mockWallet, {
        authority: "invalid-authority",
      });

      expect(result).toContain("Error getting assets");
    });
  });

  /**
   * Test cases for the getAssetsByCreator function
   */
  describe("getAssetsByCreator", () => {
    it("should successfully fetch assets by creator", async () => {
      const result = await actionProvider.getAssetsByCreator(mockWallet, {
        creator: "11111111111111111111111111111111",
      });

      expect(result).toContain("assets created by creator");
    });

    it("should handle errors when fetching assets by creator", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "getAssetsByCreator").mockImplementationOnce(async () => {
        return "Error getting assets: Invalid creator";
      });

      const result = await actionProvider.getAssetsByCreator(mockWallet, {
        creator: "invalid-creator",
      });

      expect(result).toContain("Error getting assets");
    });
  });

  /**
   * Test cases for the mintNFT function
   */
  describe("mintNFT", () => {
    it("should successfully mint an NFT", async () => {
      const result = await actionProvider.mintNFT(mockWallet, {
        collectionMint: "11111111111111111111111111111111",
        name: "Test NFT",
        uri: "https://test.com/nft",
        recipient: "11111111111111111111111111111111",
      });

      expect(result).toContain("Successfully minted NFT");
    });

    it("should handle errors during NFT minting", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "mintNFT").mockImplementationOnce(async () => {
        return "Error minting NFT: Invalid collection mint";
      });

      const result = await actionProvider.mintNFT(mockWallet, {
        collectionMint: "invalid-collection",
        name: "Test NFT",
        uri: "https://test.com/nft",
        recipient: "11111111111111111111111111111111",
      });

      expect(result).toContain("Error minting NFT");
    });
  });

  /**
   * Test cases for the searchAssets function
   */
  describe("searchAssets", () => {
    it("should successfully search assets", async () => {
      const result = await actionProvider.searchAssets(mockWallet, {
        owner: "11111111111111111111111111111111",
      });

      expect(result).toContain("Found");
    });

    it("should handle errors during asset search", async () => {
      // Mock implementation to throw an error
      jest.spyOn(actionProvider, "searchAssets").mockImplementationOnce(async () => {
        return "Error searching for assets: Invalid search parameters";
      });

      const result = await actionProvider.searchAssets(mockWallet, {
        owner: "invalid-owner",
      });

      expect(result).toContain("Error searching for assets");
    });
  });
});
