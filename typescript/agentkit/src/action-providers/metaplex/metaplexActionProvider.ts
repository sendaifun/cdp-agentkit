import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { SvmWalletProvider } from "../../wallet-providers/svmWalletProvider";
import { z } from "zod";
import { CreateAction } from "../actionDecorator";
import { DeployCollectionSchema, GetAssetSchema } from "./schema";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { toWeb3JsTransaction, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { createCollection, mplCore, ruleSet } from "@metaplex-foundation/mpl-core";
import {
    dasApi,
    DasApiAsset,
} from "@metaplex-foundation/digital-asset-standard-api";

export class MetaplexActionProvider extends ActionProvider<SvmWalletProvider> {
    constructor() {
        super("metaplex", []);
    }

    @CreateAction({
        name: "deployCollection",
        description: "Deploy a new NFT collection",
        schema: DeployCollectionSchema,
    })
    async deployCollection(
        walletProvider: SvmWalletProvider,
        args: z.infer<typeof DeployCollectionSchema>,
    ): Promise<string> {
        try {
            // Initialize Umi
            const umi = createUmi(walletProvider.getConnection().rpcEndpoint).use(mplCore());
            umi.use(walletAdapterIdentity({
                publicKey: walletProvider.getPublicKey(),
            }));

            // Generate collection signer
            const collectionSigner = generateSigner(umi);

            const formattedCreators = [
                {
                    address: publicKey(walletProvider.getPublicKey().toString()),
                    percentage: 100,
                },
            ];

            // Create collection
            const umi_tx = await createCollection(umi, {
                collection: collectionSigner,
                name: args.name,
                uri: args.uri,
                plugins: [
                    {
                        type: "Royalties",
                        basisPoints: args.royaltyBasisPoints || 500, // Default 5%
                        creators: formattedCreators,
                        ruleSet: ruleSet("None"), // Compatibility rule set
                    },
                ],
            }).buildAndSign(umi);

            const tx = toWeb3JsTransaction(umi_tx);

            const signature = await walletProvider.signAndSendTransaction(tx);

            await walletProvider.waitForSignatureResult(signature);

            return `Collection deployed successfully! Collection address: ${toWeb3JsPublicKey(collectionSigner.publicKey)}, Signature: ${signature}`;
        } catch (error: any) {
            throw new Error(`Collection deployment failed: ${error.message}`);
        }
    }

    @CreateAction({
        name: "getAsset",
        description: "Get information about an asset",
        schema: GetAssetSchema,
    })
    async getAsset(
        walletProvider: SvmWalletProvider,
        args: z.infer<typeof GetAssetSchema>,
    ): Promise<DasApiAsset> {
        try {
            const endpoint = walletProvider.getConnection().rpcEndpoint;
            const umi = createUmi(endpoint).use(dasApi());

            const asset = await umi.rpc.getAsset(publicKey(args.assetId));
            return asset;
        } catch (error: any) {
            console.error("Error retrieving asset: ", error.message);
            throw new Error(`Asset retrieval failed: ${error.message}`);
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
        return network.protocolFamily == "svm" && network.networkId === "solana-mainnet";
    }
}

/**
 * Factory function to create a new MetaplexActionProvider instance.
 *
 * @returns A new MetaplexActionProvider instance
 */
export const metaplexActionProvider = () => new MetaplexActionProvider();