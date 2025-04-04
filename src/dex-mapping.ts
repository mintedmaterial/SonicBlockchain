import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts';
import {
  PoolCreated as PoolCreatedEvent
} from '../generated/ShadowPairFactory/PoolFactory';
import { Swap as SwapEvent } from '../generated/templates/Pool/Pool';
import { Pool as PoolTemplate } from '../generated/templates';
import { 
  PoolFactory, 
  Pool,
  Swap 
} from '../generated/schema';
import { createTransaction, generateId } from './utils';
import {
  updateTokenPrices,
  calculateUSDValue,
  getTokenPriceUSD,
  USDC_ADDRESS,
  WETH_ADDRESS,
  USDC_DECIMALS,
  DEFAULT_DECIMALS
} from './pricing';

// Handle new pool creation
export function handlePoolCreated(event: PoolCreatedEvent): void {
  // Get factory name based on contract address
  let factoryName = 'Unknown Factory';
  let factoryAddress = event.address;
  
  // Identify the factory based on its address
  // Shadow DEX
  if (factoryAddress.toHexString() == '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8') {
    factoryName = 'Shadow Pair Factory';
  } 
  // SwapX DEX
  else if (factoryAddress.toHexString() == '0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663') {
    factoryName = 'SwapX Pair Factory V2';
  } 
  // Algebra DEX (SwapX)
  else if (factoryAddress.toHexString() == '0x8121a3F8c4176E9765deEa0B95FA2BDfD3016794') {
    factoryName = 'Algebra Integral V4 Factory';
  } 
  // Metro DEX
  else if (factoryAddress.toHexString() == '0x95a7e403d7cF20F675fF9273D66e94d35ba49fA3') {
    factoryName = 'Metro LB Factory';
  }
  
  // Get or create the factory entity
  let factory = PoolFactory.load(factoryAddress.toHexString());
  if (factory === null) {
    factory = new PoolFactory(factoryAddress.toHexString());
    factory.name = factoryName;
    factory.poolCount = BigInt.fromI32(0);
    factory.txCount = BigInt.fromI32(0);
    factory.totalVolumeUSD = BigDecimal.fromString('0');
    factory.totalValueLockedUSD = BigDecimal.fromString('0');
  }
  
  // Update factory stats
  factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1));
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1));
  factory.save();
  
  // Create pool entity
  let pool = new Pool(event.params.pool.toHexString());
  pool.factory = factory.id;
  pool.address = event.params.pool;
  pool.token0 = event.params.token0;
  pool.token1 = event.params.token1;
  pool.fee = BigInt.fromI32(event.params.fee);
  pool.createdAt = event.block.timestamp;
  pool.createdAtBlockNumber = event.block.number;
  pool.totalValueLockedToken0 = BigInt.fromI32(0);
  pool.totalValueLockedToken1 = BigInt.fromI32(0);
  pool.totalValueLockedUSD = BigDecimal.fromString('0');
  pool.volumeToken0 = BigInt.fromI32(0);
  pool.volumeToken1 = BigInt.fromI32(0);
  pool.volumeUSD = BigDecimal.fromString('0');
  pool.txCount = BigInt.fromI32(0);
  pool.save();
  
  // Create template for tracking this pool's events
  PoolTemplate.create(event.params.pool);
}

// Handle swap events from pools
export function handleSwap(event: SwapEvent): void {
  let pool = Pool.load(event.address.toHexString());
  
  if (pool !== null) {
    // Create swap entity
    let swap = new Swap(generateId(event));
    swap.pool = pool.id;
    swap.timestamp = event.block.timestamp;
    swap.sender = event.params.sender;
    swap.recipient = event.params.recipient;
    swap.origin = event.transaction.from;
    
    // Convert amounts to positive values if needed
    let amount0 = event.params.amount0;
    let amount1 = event.params.amount1;
    
    swap.amount0 = amount0.lt(BigInt.fromI32(0)) ? amount0.neg() : amount0;
    swap.amount1 = amount1.lt(BigInt.fromI32(0)) ? amount1.neg() : amount1;
    
    // Get token addresses
    let token0Address = Address.fromString(pool.token0.toHexString());
    let token1Address = Address.fromString(pool.token1.toHexString());
    
    // Update token prices based on this swap
    updateTokenPrices(
      token0Address,
      token1Address,
      swap.amount0,
      swap.amount1,
      event.block.timestamp
    );
    
    // Calculate USD value of the swap
    let token0USD = calculateUSDValue(token0Address, swap.amount0);
    let token1USD = calculateUSDValue(token1Address, swap.amount1);
    
    // Use the larger USD value for accuracy
    let amountUSD = token0USD.gt(token1USD) ? token0USD : token1USD;
    
    swap.amountUSD = amountUSD;
    swap.transaction = event.transaction.hash.toHexString();
    swap.blockNumber = event.block.number;
    swap.save();
    
    // Update pool stats
    pool.txCount = pool.txCount.plus(BigInt.fromI32(1));
    pool.volumeToken0 = pool.volumeToken0.plus(swap.amount0);
    pool.volumeToken1 = pool.volumeToken1.plus(swap.amount1);
    pool.volumeUSD = pool.volumeUSD.plus(amountUSD);
    pool.save();
    
    // Update factory stats
    let factory = PoolFactory.load(pool.factory);
    if (factory !== null) {
      factory.txCount = factory.txCount.plus(BigInt.fromI32(1));
      factory.totalVolumeUSD = factory.totalVolumeUSD.plus(amountUSD);
      factory.save();
    }
  }
}
