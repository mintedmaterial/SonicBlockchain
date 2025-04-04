# Querying the Sonic Blockchain Subgraph

This guide provides examples and tools for querying the Sonic Blockchain subgraph data. We've provided two methods for interacting with the subgraph:

1. An interactive HTML interface
2. A Python script for programmatic access

## Interactive HTML Interface

The `query-examples.html` file provides a web interface with pre-built queries for common data requests. To use it:

1. Open `query-examples.html` in a web browser
2. Click on any of the "Run Query" buttons to execute that specific query
3. Results will be displayed at the bottom of the page

Available queries include:
- Recent Transactions
- DEX Pools Overview
- Recent Swaps
- Bridge Transfers
- Staking Activity
- Time-based Stats (2hr, 1day, 3day)

## Python Script

The `query_subgraph.py` script provides programmatic access to the subgraph data. It requires Python and the `requests` library.

### Setup

```bash
pip install requests
```

### Usage

Run the script:
```bash
python query_subgraph.py
```

Or import functions in your own code:
```python
from query_subgraph import get_recent_transactions, get_pool_stats

# Get 5 most recent transactions
transactions = get_recent_transactions(5)

# Get top 3 pools by TVL
pools = get_pool_stats(3)
```

### Available Functions

- `get_recent_transactions(limit=5)`: Fetch recent transactions
- `get_pool_stats(limit=5)`: Get statistics for top pools by TVL
- `get_recent_swaps(limit=5)`: Fetch recent swap events
- `get_bridge_activity(limit=5)`: Get recent bridge transfer events
- `get_latest_stats()`: Get latest statistics across different time periods

## Custom Queries

Both tools can be modified to add custom queries. The subgraph schema defines the following main entities:

- `Transaction`: Basic transaction information
- `Pool`: DEX pool data
- `Swap`: DEX swap events
- `BridgeTransfer`: Cross-chain bridge events
- `SFCDelegation`: Staking events
- `HourlyStats`, `DailyStats`, `ThreeDayStats`: Time-based aggregated statistics

For the full schema and available fields, refer to `schema.graphql` in the subgraph repository.

## Example Custom Query

Here's an example of a custom query to get specific pool data:

```graphql
{
  pools(
    where: {
      totalValueLockedUSD_gt: "1000000"
    }
    orderBy: volumeUSD
    orderDirection: desc
    first: 5
  ) {
    id
    token0
    token1
    totalValueLockedUSD
    volumeUSD
  }
}
```

## Notes

- The subgraph may take some time to index new data
- All timestamp fields are returned as Unix timestamps and converted to human-readable format in both tools
- Monetary values (e.g., totalValueLockedUSD) are returned as strings to preserve precision
- The subgraph endpoint uses a default query key: https://subgraph.satsuma-prod.com/496ce6650bfa/colts-team--432938/sonic-blockchain-subgraph/api
- For production use, you may need to request a dedicated API key
