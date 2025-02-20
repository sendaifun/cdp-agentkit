# Metaplex Action Provider

This directory contains the **MetaplexActionProvider** implementation, which provides actions to interact with the **Metaplex** for token minting.

## Directory Structure

``` 
metaplex/
├── metaplexActionProvider.ts    # Main provider with Metaplex minting functionality
├── schemas.ts                  # Metaplex action schemas
├── index.ts                    # Main exports
└── README.md                   # This file
```

## Actions

### Metaplex Token Deployment Action
- `deployCollection`: Deploy a new NFT collection using **Metaplex**
  - Constructs and signs the collection deployment transaction
  - Returns the **transaction signature** upon success

## Adding New Actions

To add new Metaplex actions:

1. Define the schema in `schemas.ts`
2. Implement the action in `metaplexActionProvider.ts`
3. Ensure proper **error handling and logging**

## Network Support
The Metaplex Action Provider currently supports:
- **Solana Mainnet** (`solana-mainnet`)

## Notes
- Default creator is the wallet provider's public key
- Transactions are **signed and executed automatically** within the provider.

For more information on the **Metaplex API**, visit [Metaplex Docs](https://developers.metaplex.com).

