import z from "zod";

/**
 * Schema for deploying a token using Metaplex.
 */
export const DeployTokenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  uri: z.string().url("URI must be a valid URL"),
  symbol: z.string().min(1, "Symbol is required"),
  decimals: z.number().optional(),
  authority: z
    .object({
      mintAuthority: z.string().nullable().optional(),
      freezeAuthority: z.string().nullable().optional(),
      updateAuthority: z.string().nullable().optional(),
      isMutable: z.boolean().optional(),
    })
    .optional(),
  initialSupply: z.number().optional(),
});

/**
 * Schema for deploying an NFT collection using Metaplex.
 */
export const DeployCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  uri: z.string().url("URI must be a valid URL"),
  royaltyBasisPoints: z.number().min(0).max(10000).optional(),
  creators: z
    .array(
      z.object({
        address: z.string().min(1, "Creator address is required"),
        percentage: z.number().min(0).max(100),
      }),
    )
    .optional(),
});

/**
 * Schema for getting asset info using Metaplex.
 */
export const GetAssetSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
});

/**
 * Schema for getting assets by authority using Metaplex.
 */
export const GetAssetsByAuthoritySchema = z.object({
  authority: z.string().min(1, "Authority address is required"),
  sortBy: z
    .object({
      sortBy: z.enum(["created", "updated", "recentAction", "none"]),
      sortDirection: z.enum(["asc", "desc"]),
    })
    .optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
});

/**
 * Schema for getting assets by creator using Metaplex.
 */
export const GetAssetsByCreatorSchema = z.object({
  creator: z.string().min(1, "Creator address is required"),
  sortBy: z
    .object({
      sortBy: z.enum(["created", "updated", "recentAction", "none"]),
      sortDirection: z.enum(["asc", "desc"]),
    })
    .optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
  before: z.string().optional(),
  after: z.string().optional(),
});

/**
 * Schema for minting an NFT using Metaplex.
 */
export const MintNFTSchema = z.object({
  collectionMint: z.string().min(32, "Invalid collection mint address"),
  name: z.string().min(1, "Name is required"),
  uri: z.string().url("URI must be a valid URL"),
  recipient: z.string().min(32, "Invalid recipient address"),
});

/**
 * Schema for transferring an NFT using Metaplex.
 */
export const SearchAssetsSchema = z.object({
  negate: z.boolean().optional(),
  conditionType: z.enum(["all", "any"]).optional(),
  interface: z.string().optional(),
  jsonUri: z.string().optional(),
  owner: z.string().optional(),
  ownerType: z.enum(["single", "token"]).optional(),
  creator: z.string().optional(),
  creatorVerified: z.boolean().optional(),
  authority: z.string().optional(),
  delegate: z.string().optional(),
  frozen: z.boolean().optional(),
  supply: z.number().optional(),
  supplyMint: z.string().optional(),
  compressed: z.boolean().optional(),
  compressible: z.boolean().optional(),
  royaltyModel: z.enum(["creators", "fanout", "single"]).optional(),
  royaltyTarget: z.string().optional(),
  royaltyAmount: z.number().optional(),
  burnt: z.boolean().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
});
