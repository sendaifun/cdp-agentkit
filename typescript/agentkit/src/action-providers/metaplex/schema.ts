import { z } from "zod";

export const DeployCollectionSchema = z.object({
    name: z.string().min(1, "Name is required").describe("The name of the collection"),
    uri: z.string().url("URI must be a valid URL").describe("The URI of the collection"),
    royaltyBasisPoints: z.number().min(0).max(10000).optional().describe("The royalty basis points of the collection, e.g., 500 = 5%"),
  })
  .describe("Deploy a new NFT collection using Metaplex");


export const GetAssetSchema = z.object({
    assetId: z.string().describe("The ID of the asset to get information about"),
  })
  .describe("Get information about an asset using Metaplex");
