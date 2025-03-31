import { ActionProvider } from "../actionProvider";
import type { Network } from "../../network";
import type { SvmWalletProvider } from "../../wallet-providers";
import type z from "zod";
import { CreateAction } from "../actionDecorator";
import {
  DeployCollectionSchema,
  DeployTokenSchema,
  GetAssetSchema,
  GetAssetsByAuthoritySchema,
  GetAssetsByCreatorSchema,
  MintNFTSchema,
  SearchAssetsSchema,
} from "./schemas";
import { SolanaAgentKit } from "solana-agent-kit";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import { PublicKey, type Transaction, type VersionedTransaction } from "@solana/web3.js";

/**
 * MetaplexActionProvider handles token and NFT creation using Metaplex.
 */
export class MetaplexActionProvider extends ActionProvider<SvmWalletProvider> {
  /**
   * Initializes Metaplex
   */
  constructor() {
    super("metaplex", []);
  }

  /**
   * Deploys a new SPL token using Metaplex.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for deploying the token
   * @returns A message indicating success or failure
   */
  @CreateAction({
    name: "deploy_token",
    description: `
    Deploys a new SPL token using Metaplex.
    - Name, URI, and symbol are required.
    - Decimals default to 9.
    - All authorities default to the wallet's public key. (e.g mintAuthority, freezeAuthority, updateAuthority)`,
    schema: DeployTokenSchema,
  })
  async deployToken(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof DeployTokenSchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },
          signAndSendTransaction: async tx => ({
            signature: await walletProvider.signAndSendTransaction(tx),
          }),
          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        { signOnly: false },
      ).use(NFTPlugin);
      const res = await sakInstance.methods.deployToken(
        sakInstance,
        args.name,
        args.uri,
        args.symbol,
        {
          isMutable: args.authority?.isMutable,
          mintAuthority: args.authority?.mintAuthority
            ? new PublicKey(args.authority.mintAuthority)
            : null,
          freezeAuthority: args.authority?.freezeAuthority
            ? new PublicKey(args.authority.freezeAuthority)
            : null,
          updateAuthority: args.authority?.updateAuthority
            ? new PublicKey(args.authority.updateAuthority)
            : null,
        },
        args.decimals,
        args.initialSupply,
      );
      // @ts-expect-error mint is defined
      const mintAddress = res.mint.toBase58();
      return `Successfully deployed token with name: ${args.name}, symbol: ${args.symbol}, mint: ${mintAddress}, and URI: ${args.uri}`;
    } catch (e) {
      return `Error deploying token: ${e}`;
    }
  }

  /**
   * Deploys a new NFT collection on the Solana blockchain using Metaplex.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for deploying the collection
   * @returns Promise<string>
   */
  @CreateAction({
    name: "deploy_collection",
    description: `
    Deploy a new NFT collection on the Solana blockchain using Metaplex.
    - Name and URI are required.`,
    schema: DeployCollectionSchema,
  })
  async deployCollection(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof DeployCollectionSchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },
          signAndSendTransaction: async tx => ({
            signature: await walletProvider.signAndSendTransaction(tx),
          }),
          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        {},
      ).use(NFTPlugin);
      const res = await sakInstance.methods.deployCollection(sakInstance, {
        name: args.name,
        uri: args.uri,
        royaltyBasisPoints: args.royaltyBasisPoints,
        creators: args.creators,
      });
      const collectionAddress = res.collectionAddress.toBase58();
      return `Successfully deployed collection with name: ${args.name}, collection address: ${collectionAddress}, and URI: ${args.uri}`;
    } catch (e) {
      return `Error deploying collection: ${e}`;
    }
  }

  /**
   * Fetch asset details using the Metaplex DAS API.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for fetching the asset
   * @returns Promise<string>
   */
  @CreateAction({
    name: "get_asset",
    description: `
    Fetch asset details using the Metaplex DAS API.
    - Asset ID is required.`,
    schema: GetAssetSchema,
  })
  async getAsset(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof GetAssetSchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },
          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        {},
      ).use(NFTPlugin);
      const res = await sakInstance.methods.getAsset(sakInstance, args.assetId);
      const assetDetails = JSON.stringify(res, null, 2);
      return `Here are the asset details for asset ID: ${args.assetId}, ${assetDetails}`;
    } catch (e) {
      return `Error getting asset: ${e}`;
    }
  }

  /**
   * Fetch a list of assets owned by a specific address using the Metaplex DAS API.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for fetching the assets
   * @returns Promise<string>
   */
  @CreateAction({
    name: "get_assets_by_authority",
    description: `
    Fetch a list of assets owned by a specific address using the Metaplex DAS API.
    - Authority address is required.`,
    schema: GetAssetsByAuthoritySchema,
  })
  async getAssetsByAuthority(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof GetAssetsByAuthoritySchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },

          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        {},
      ).use(NFTPlugin);
      const res = await sakInstance.methods.getAssetsByAuthority(sakInstance, {
        ...args,
        // @ts-expect-error - Type mismatch in plugin
        authority: args.authority,
      });
      const assets = JSON.stringify(res, null, 2);
      return `Here are the assets owned by authority address: ${args.authority}, ${assets}`;
    } catch (e) {
      return `Error getting assets: ${e}`;
    }
  }

  /**
   * Fetch a list of assets created by a specific address using the Metaplex DAS API.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for fetching the assets
   * @returns Promise<string>
   */
  @CreateAction({
    name: "get_assets_by_creator",
    description: `
    Fetch a list of assets created by a specific address using the Metaplex DAS API.
    - Creator address is required.`,
    schema: GetAssetsByCreatorSchema,
  })
  async getAssetsByCreator(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof GetAssetsByCreatorSchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },
          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        {},
      ).use(NFTPlugin);
      const res = await sakInstance.methods.getAssetsByCreator(sakInstance, {
        ...args,
        // @ts-expect-error - Type mismatch in plugin, metaplex has a PublicKey type that's just a glorified string extention
        creator: args.creator,
      });
      const assets = JSON.stringify(res, null, 2);
      return `Here are the assets created by creator address: ${args.creator}, ${assets}`;
    } catch (e) {
      return `Error getting assets: ${e}`;
    }
  }

  /**
   * Mint an NFT using Metaplex.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for minting the NFT
   * @returns Promise<string>
   */
  @CreateAction({
    name: "mint_nft",
    description: `
    Mint an NFT using Metaplex.
    - Collection address, metadata URI, and token metadata are required.`,
    schema: MintNFTSchema,
  })
  async mintNFT(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof MintNFTSchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },
          signAndSendTransaction: async tx => ({
            signature: await walletProvider.signAndSendTransaction(tx),
          }),
          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        {},
      ).use(NFTPlugin);
      const res = await sakInstance.methods.mintCollectionNFT(
        sakInstance,
        new PublicKey(args.collectionMint),
        {
          name: args.name,
          uri: args.uri,
        },
      );
      const nftAddress = res.mint.toBase58();
      return `Successfully minted NFT with address: ${nftAddress}`;
    } catch (e) {
      return `Error minting NFT: ${e}`;
    }
  }

  /**
   * Search for assets using the Metaplex DAS API.
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for searching for assets
   * @returns Promise<string>
   */
  @CreateAction({
    name: "search_assets",
    description: `
    Search for assets using the Metaplex DAS API.
    - All parameters are optional, however at least one is needed for search.`,
    schema: SearchAssetsSchema,
  })
  async searchAssets(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof SearchAssetsSchema>,
  ): Promise<string> {
    try {
      const sakInstance = new SolanaAgentKit(
        {
          ...walletProvider,
          publicKey: walletProvider.getPublicKey(),
          sendTransaction: async transaction => {
            return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signTransaction: async transaction => {
            return await walletProvider.signTransaction(transaction as VersionedTransaction);
          },
          // @ts-expect-error - Type mismatch in plugin
          signAllTransactions: async transactions => {
            const signedTransactions: (VersionedTransaction | Transaction)[] = [];
            for (let i = 0; i < transactions.length; i++) {
              signedTransactions[i] = await walletProvider.signTransaction(
                transactions[i] as VersionedTransaction,
              );
            }
            return signedTransactions;
          },
          signMessage: async message => {
            return message;
          },
        },
        walletProvider.getConnection().rpcEndpoint,
        {},
      ).use(NFTPlugin);
      const res = await sakInstance.methods.searchAssets(sakInstance, {
        frozen: args.frozen,
        // @ts-expect-error - Type mismatch in plugin
        creator: args.creator ?? null,
        jsonUri: args.jsonUri,
        // @ts-expect-error - Type mismatch in plugin
        authority: args.authority ?? null,
        conditionType: args.conditionType,
        compressed: args.compressed,
        // @ts-expect-error - Type mismatch in plugin
        owner: args.owner ?? null,
        ownerType: args.ownerType,
        // @ts-expect-error - Type mismatch in plugin
        supplyMint: args.supplyMint ?? null,
      });
      const assets = JSON.stringify(res.items, null, 2);
      return `Found asset: ${assets}`;
    } catch (e) {
      return `Error searching for assets: ${e}`;
    }
  }

  /**
   * Checks if the action provider supports the given network.
   * Only supports Solana networks.
   *
   * @param network - The network to check support for
   * @returns True if the network is a Solana network
   */
  supportsNetwork(network: Network): boolean {
    return network.protocolFamily === "svm" && network.networkId === "solana-mainnet";
  }
}
