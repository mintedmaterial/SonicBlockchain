# Sonic Blockchain Subgraph

This subgraph indexes events from various contracts on the Sonic blockchain, including DEX activity, token transfers, staking operations, bridge transactions, and infrastructure messages.

## Contracts Indexed

### Core Tokens
- Wrapped S (wS): `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38`
- Wrapped Ether (WETH): `0x50c42dEAcD8Fc9773493ED674b675bE577f2634b`
- USDC (Bridged): `0x29219dd400f2Bf60E5a23d13Be72B486D4038894`
- EURC (Bridged): `0xe715cba7b5ccb33790cebff1436809d36cb17e57`
- USDT (Bridged): `0x6047828dc181963ba44974801ff68e538da5eaf9`

### Core Infrastructure
- SFC (Staking): `0xFC00FACE00000000000000000000000000000000`
- Bridge: `0x9Ef7629F9B930168b76283AdD7120777b3c895b3`
- MessageBus: `0xB5B371B75f9850dDD6CCB6C436DB54972a925308`
- FTM to S Upgrade Portal: `0x3561607590e28e0848ba3B67074C676D6D1C9953`

### DEX Factories
- Shadow DEX: `0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8`
- SwapX V2: `0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663`
- Algebra (SwapX): `0x8121a3F8c4176E9765deEa0B95FA2BDfD3016794`
- Metro DEX: `0x95a7e403d7cF20F675fF9273D66e94d35ba49fA3`

## Features

1. **Token Tracking**
   - Transfer and approval events for all major tokens
   - Price tracking in USD terms
   - Volume and liquidity metrics

2. **DEX Activity**
   - Pool creation events
   - Swap tracking with USD values
   - Factory-level statistics
   - Cross-DEX analytics

3. **Staking Operations**
   - Delegation events
   - Undelegation tracking
   - Reward claims
   - Lock-up periods

4. **Bridge & Infrastructure**
   - Cross-chain transfers
   - Message passing
   - FTM to S upgrades

## Example Queries

### Get Token Prices
```graphql
{
  tokenPrices(first: 10) {
    token
    priceUSD
    lastUpdatedTimestamp
  }
}
```

### Get Top Pools by Volume
```graphql
{
  pools(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    factory {
      name
    }
    token0
    token1
    volumeUSD
    totalValueLockedUSD
  }
}
```

### Get Recent Swaps
```graphql
{
  swaps(first: 20, orderBy: timestamp, orderDirection: desc) {
    pool {
      id
      factory {
        name
      }
    }
    amount0
    amount1
    amountUSD
    timestamp
  }
}
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Generate types:
```bash
npm run codegen
```

3. Build the subgraph:
```bash
npm run build
```

4. Deploy to Alchemy Subgraphs:
```bash
npm run deploy
```

## License

MIT
