import requests
import json
from datetime import datetime

SUBGRAPH_URL = "https://subgraph.satsuma-prod.com/496ce6650bfa/colts-team--432938/sonic-blockchain-subgraph/api"

def execute_query(query):
    """Execute a GraphQL query against the subgraph."""
    try:
        response = requests.post(
            SUBGRAPH_URL,
            json={'query': query}
        )
        return response.json()
    except Exception as e:
        return {'error': str(e)}

def format_timestamp(timestamp):
    """Convert Unix timestamp to human-readable format."""
    return datetime.fromtimestamp(int(timestamp)).strftime('%Y-%m-%d %H:%M:%S')

def get_recent_transactions(limit=5):
    """Get most recent transactions."""
    query = """
    {
        transactions(
            first: %d
            orderBy: timestamp
            orderDirection: desc
        ) {
            id
            hash
            timestamp
            from
            to
            value
            gasUsed
            gasPrice
        }
    }
    """ % limit
    
    result = execute_query(query)
    if 'data' in result and 'transactions' in result['data']:
        for tx in result['data']['transactions']:
            tx['timestamp'] = format_timestamp(tx['timestamp'])
    return result

def get_pool_stats(limit=5):
    """Get statistics for top pools by TVL."""
    query = """
    {
        pools(
            first: %d
            orderBy: totalValueLockedUSD
            orderDirection: desc
        ) {
            id
            factory {
                name
            }
            token0
            token1
            totalValueLockedUSD
            volumeUSD
        }
    }
    """ % limit
    
    return execute_query(query)

def get_recent_swaps(limit=5):
    """Get most recent swap events."""
    query = """
    {
        swaps(
            first: %d
            orderBy: timestamp
            orderDirection: desc
        ) {
            id
            timestamp
            pool {
                id
            }
            sender
            recipient
            amount0
            amount1
            amountUSD
        }
    }
    """ % limit
    
    result = execute_query(query)
    if 'data' in result and 'swaps' in result['data']:
        for swap in result['data']['swaps']:
            swap['timestamp'] = format_timestamp(swap['timestamp'])
    return result

def get_bridge_activity(limit=5):
    """Get recent bridge transfer events."""
    query = """
    {
        bridgeTransfers(
            first: %d
            orderBy: timestamp
            orderDirection: desc
        ) {
            id
            tokenAddress
            from
            to
            amount
            timestamp
            sourceChain
            destinationChain
        }
    }
    """ % limit
    
    result = execute_query(query)
    if 'data' in result and 'bridgeTransfers' in result['data']:
        for transfer in result['data']['bridgeTransfers']:
            transfer['timestamp'] = format_timestamp(transfer['timestamp'])
    return result

def get_latest_stats():
    """Get latest statistics across different time periods."""
    query = """
    {
        hourlyStats(first: 1, orderBy: timestamp, orderDirection: desc) {
            id
            timestamp
            transactionCount
            activeAddresses
            totalValueLocked
            bridgeInflow
            bridgeOutflow
            sfcTotalStaked
            dexVolume
        }
        dailyStats(first: 1, orderBy: date, orderDirection: desc) {
            id
            date
            transactionCount
            activeAddresses
            totalValueLocked
            bridgeInflow
            bridgeOutflow
            sfcTotalStaked
            dexVolume
        }
        threeDayStats(first: 1, orderBy: startTimestamp, orderDirection: desc) {
            id
            startTimestamp
            endTimestamp
            transactionCount
            activeAddresses
            totalValueLocked
            bridgeInflow
            bridgeOutflow
            sfcTotalStaked
            dexVolume
        }
    }
    """
    
    result = execute_query(query)
    if 'data' in result:
        if 'hourlyStats' in result['data'] and result['data']['hourlyStats']:
            result['data']['hourlyStats'][0]['timestamp'] = format_timestamp(
                result['data']['hourlyStats'][0]['timestamp']
            )
        if 'threeDayStats' in result['data'] and result['data']['threeDayStats']:
            stats = result['data']['threeDayStats'][0]
            stats['startTimestamp'] = format_timestamp(stats['startTimestamp'])
            stats['endTimestamp'] = format_timestamp(stats['endTimestamp'])
    return result

def main():
    """Example usage of the query functions."""
    print("\n=== Recent Transactions ===")
    print(json.dumps(get_recent_transactions(3), indent=2))
    
    print("\n=== Top Pools by TVL ===")
    print(json.dumps(get_pool_stats(3), indent=2))
    
    print("\n=== Recent Swaps ===")
    print(json.dumps(get_recent_swaps(3), indent=2))
    
    print("\n=== Recent Bridge Activity ===")
    print(json.dumps(get_bridge_activity(3), indent=2))
    
    print("\n=== Latest Statistics ===")
    print(json.dumps(get_latest_stats(), indent=2))

if __name__ == "__main__":
    main()
