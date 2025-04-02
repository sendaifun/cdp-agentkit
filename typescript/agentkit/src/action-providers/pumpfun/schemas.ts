import z from "zod";

/**
 * Input schema for the pumpfun launch token action
 */
export const LaunchTokenSchema = z.object({
  tokenName: z.string().min(1).max(32).describe("Name of the token"),
  tokenTicker: z.string().min(2).max(10).describe("Ticker symbol of the token"),
  description: z.string().min(1).max(1000).describe("Description of the token"),
  imageUrl: z.string().url().describe("URL of the token image"),
  twitter: z.string().optional().describe("Twitter handle (optional)"),
  telegram: z.string().optional().describe("Telegram group link (optional)"),
  website: z.string().url().optional().describe("Website URL (optional)"),
  initialLiquiditySOL: z.number().min(0.0001).default(0.0001).describe("Initial liquidity in SOL"),
  slippageBps: z
    .number()
    .min(1)
    .max(1000)
    .default(5)
    .describe("Slippage tolerance in basis points"),
  priorityFee: z.number().min(0.00001).default(0.00005).describe("Priority fee in SOL"),
});
