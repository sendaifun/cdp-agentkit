import { ActionProvider } from "../actionProvider";
import type { SvmWalletProvider } from "../../wallet-providers";
import type z from "zod";
import { CreateAction } from "../actionDecorator";
import { SolanaAgentKit } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import { LaunchTokenSchema } from "./schemas";
import type { Network } from "../../network";

/**
 * PumpfunActionProvider is an action provider for pump.fun
 */
export class PumpfunActionProvider extends ActionProvider {
  /**
   * Constructs a new PumpfunActionProvider
   */
  constructor() {
    super("pumpfun", []);
  }

  /**
   * Launch a new token on pump.fun with customizable metadata and initial liquidity
   *
   * @param walletProvider - The wallet provider to use for signing transactions
   * @param args - The arguments for the action
   * @returns Promise<{ metadataUri: string; mint: string }>
   */
  @CreateAction({
    name: "launch_pumpfun_token",
    description: "Launch a new token on pump.fun with customizable metadata and initial liquidity",
    schema: LaunchTokenSchema,
  })
  async launchPumpfunToken(
    walletProvider: SvmWalletProvider,
    args: z.infer<typeof LaunchTokenSchema>,
  ): Promise<{ metadataUri: string; mint: string }> {
    const sakInstance = new SolanaAgentKit(
      {
        publicKey: walletProvider.getPublicKey(),
        sendTransaction: async transaction => {
          return await walletProvider.signAndSendTransaction(transaction as VersionedTransaction);
        },
        // @ts-expect-error - type mismatch between SolanaAgentKit and SvmWalletProvider
        signTransaction: async transaction => {
          return await walletProvider.signTransaction(transaction as VersionedTransaction);
        },
        // @ts-expect-error - type mismatch between SolanaAgentKit and SvmWalletProvider
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
    ).use(TokenPlugin);

    const res = await sakInstance.methods.launchPumpFunToken(
      sakInstance,
      args.tokenName,
      args.tokenTicker,
      args.description,
      args.imageUrl,
      {
        initialLiquiditySOL: args.initialLiquiditySOL,
        website: args.website,
        twitter: args.twitter,
        telegram: args.telegram,
        slippageBps: args.slippageBps,
        priorityFee: args.priorityFee,
      },
    );

    return {
      mint: res.mint,
      metadataUri: res.metadataUri,
    };
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

export const pumpfunActionProvider = () => new PumpfunActionProvider();
