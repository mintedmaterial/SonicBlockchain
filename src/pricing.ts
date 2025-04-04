import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts';
import { TokenPrice } from '../generated/schema';

// Addresses for tokens used in price calculations
export const USDC_ADDRESS = '0x29219dd400f2Bf60E5a23d13Be72B486D4038894';
export const WETH_ADDRESS = '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b';
export const WS_ADDRESS = '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38';

// Decimals for common tokens
export const USDC_DECIMALS = 6;
export const DEFAULT_DECIMALS = 18;

export const ZERO_BD = BigDecimal.fromString('0');
export const ONE_BD = BigDecimal.fromString('1');
export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);

// Convert decimals
export function exponentToBigDecimal(decimals: number): BigDecimal {
  let bd = BigDecimal.fromString('1');
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'));
  }
  return bd;
}

// Convert BigInt to BigDecimal with proper decimal places
export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: number): BigDecimal {
  if (exchangeDecimals == 0) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

// Find or create a token price entity
export function getOrCreateTokenPrice(tokenAddress: Address): TokenPrice {
  let tokenPrice = TokenPrice.load(tokenAddress.toHexString());
  
  if (tokenPrice === null) {
    tokenPrice = new TokenPrice(tokenAddress.toHexString());
    tokenPrice.token = tokenAddress;
    tokenPrice.priceUSD = ZERO_BD;
    tokenPrice.lastUpdatedTimestamp = ZERO_BI;
    
    // Set initial prices for known tokens
    if (tokenAddress.toHexString() == USDC_ADDRESS) {
      tokenPrice.priceUSD = ONE_BD; // USDC is pegged to $1
    } else if (tokenAddress.toHexString() == WETH_ADDRESS) {
      tokenPrice.priceUSD = BigDecimal.fromString('3500'); // Example initial price for ETH
    } else if (tokenAddress.toHexString() == WS_ADDRESS) {
      tokenPrice.priceUSD = BigDecimal.fromString('1.5'); // Example initial price for wS
    }
    
    tokenPrice.save();
  }
  
  return tokenPrice;
}

// Update token price based on a swap
export function updateTokenPrices(
  token0Address: Address, 
  token1Address: Address,
  token0Amount: BigInt,
  token1Amount: BigInt,
  blockTimestamp: BigInt,
  token0Decimals: number = DEFAULT_DECIMALS,
  token1Decimals: number = DEFAULT_DECIMALS
): void {
  // Skip if either amount is zero
  if (token0Amount.equals(ZERO_BI) || token1Amount.equals(ZERO_BI)) {
    return;
  }
  
  // Convert token amounts to decimals
  let amount0 = convertTokenToDecimal(token0Amount, token0Decimals);
  let amount1 = convertTokenToDecimal(token1Amount, token1Decimals);
  
  // Get existing token price entities
  let token0Price = getOrCreateTokenPrice(token0Address);
  let token1Price = getOrCreateTokenPrice(token1Address);
  
  // Update prices if one token is USDC (direct price)
  if (token0Address.toHexString() == USDC_ADDRESS) {
    // Token1 price in USD = USDC amount / Token1 amount
    token1Price.priceUSD = amount0.div(amount1);
    token1Price.lastUpdatedTimestamp = blockTimestamp;
    token1Price.save();
  } else if (token1Address.toHexString() == USDC_ADDRESS) {
    // Token0 price in USD = USDC amount / Token0 amount
    token0Price.priceUSD = amount1.div(amount0);
    token0Price.lastUpdatedTimestamp = blockTimestamp;
    token0Price.save();
  } 
  // If neither token is USDC but one has a price, derive the other's price
  else if (token0Price.priceUSD.notEqual(ZERO_BD)) {
    // Token1 price = (Token0 amount * Token0 price) / Token1 amount
    token1Price.priceUSD = amount0.times(token0Price.priceUSD).div(amount1);
    token1Price.lastUpdatedTimestamp = blockTimestamp;
    token1Price.save();
  } else if (token1Price.priceUSD.notEqual(ZERO_BD)) {
    // Token0 price = (Token1 amount * Token1 price) / Token0 amount
    token0Price.priceUSD = amount1.times(token1Price.priceUSD).div(amount0);
    token0Price.lastUpdatedTimestamp = blockTimestamp;
    token0Price.save();
  }
}

// Get token price in USD
export function getTokenPriceUSD(tokenAddress: Address): BigDecimal {
  let tokenPrice = TokenPrice.load(tokenAddress.toHexString());
  if (tokenPrice !== null) {
    return tokenPrice.priceUSD;
  }
  return ZERO_BD;
}

// Calculate USD value for a token amount
export function calculateUSDValue(
  tokenAddress: Address, 
  tokenAmount: BigInt, 
  tokenDecimals: number = DEFAULT_DECIMALS
): BigDecimal {
  let tokenPrice = getTokenPriceUSD(tokenAddress);
  let amount = convertTokenToDecimal(tokenAmount, tokenDecimals);
  return amount.times(tokenPrice);
}
