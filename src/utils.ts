import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Transaction, HourlyStats, DailyStats, ThreeDayStats } from '../generated/schema';

export function createTransaction(event: ethereum.Event): Transaction {
  const transaction = new Transaction(event.transaction.hash.toHexString());
  transaction.hash = event.transaction.hash.toHexString();
  transaction.blockNumber = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.from = event.transaction.from;
  transaction.to = event.transaction.to;
  transaction.value = event.transaction.value;
  let receipt = event.receipt;
  transaction.gasUsed = receipt ? receipt.gasUsed : BigInt.fromI32(0);
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.save();
  
  return transaction;
}

export function generateId(event: ethereum.Event): Bytes {
  return event.transaction.hash.concatI32(event.logIndex.toI32());
}

// Time constants
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_THREE_DAYS = SECONDS_PER_DAY * 3;

// Helper functions for time periods
export function getHourStartTimestamp(timestamp: BigInt): BigInt {
  const hourIndex = timestamp.toI32() / SECONDS_PER_HOUR;
  return BigInt.fromI32(hourIndex * SECONDS_PER_HOUR);
}

export function getDayStartTimestamp(timestamp: BigInt): BigInt {
  const dayIndex = timestamp.toI32() / SECONDS_PER_DAY;
  return BigInt.fromI32(dayIndex * SECONDS_PER_DAY);
}

export function getThreeDayStartTimestamp(timestamp: BigInt): BigInt {
  const threeDayIndex = timestamp.toI32() / SECONDS_PER_THREE_DAYS;
  return BigInt.fromI32(threeDayIndex * SECONDS_PER_THREE_DAYS);
}

// ID generation functions
export function getHourId(timestamp: BigInt): string {
  const date = new Date(timestamp.toI32() * 1000);
  return date.getUTCFullYear().toString() + 
         '-' + 
         (date.getUTCMonth() + 1).toString().padStart(2, '0') + 
         '-' + 
         date.getUTCDate().toString().padStart(2, '0') + 
         '-' + 
         date.getUTCHours().toString().padStart(2, '0');
}

export function getDayId(timestamp: BigInt): string {
  const date = new Date(timestamp.toI32() * 1000);
  return date.getUTCFullYear().toString() + 
         '-' + 
         (date.getUTCMonth() + 1).toString().padStart(2, '0') + 
         '-' + 
         date.getUTCDate().toString().padStart(2, '0');
}

export function getThreeDayId(timestamp: BigInt): string {
  const startTimestamp = getThreeDayStartTimestamp(timestamp);
  const date = new Date(startTimestamp.toI32() * 1000);
  return date.getUTCFullYear().toString() + 
         '-' + 
         (date.getUTCMonth() + 1).toString().padStart(2, '0') + 
         '-' + 
         date.getUTCDate().toString().padStart(2, '0');
}

// Stats creation/update functions
export function getOrCreateHourlyStats(timestamp: BigInt): HourlyStats {
  const hourId = getHourId(timestamp);
  let stats = HourlyStats.load(hourId);
  
  if (stats === null) {
    stats = new HourlyStats(hourId);
    stats.timestamp = getHourStartTimestamp(timestamp);
    stats.transactionCount = BigInt.fromI32(0);
    stats.activeAddresses = BigInt.fromI32(0);
    stats.totalValueLocked = BigInt.fromI32(0);
    stats.bridgeInflow = BigInt.fromI32(0);
    stats.bridgeOutflow = BigInt.fromI32(0);
    stats.sfcTotalStaked = BigInt.fromI32(0);
    stats.sfcTotalDelegated = BigInt.fromI32(0);
    stats.dexVolume = BigInt.fromI32(0).toBigDecimal();
    stats.dexSwapCount = BigInt.fromI32(0);
    stats.save();
  }
  
  return stats;
}

export function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  const dayId = getDayId(timestamp);
  let stats = DailyStats.load(dayId);
  
  if (stats === null) {
    stats = new DailyStats(dayId);
    stats.date = dayId;
    stats.transactionCount = BigInt.fromI32(0);
    stats.activeAddresses = BigInt.fromI32(0);
    stats.totalValueLocked = BigInt.fromI32(0);
    stats.bridgeInflow = BigInt.fromI32(0);
    stats.bridgeOutflow = BigInt.fromI32(0);
    stats.sfcTotalStaked = BigInt.fromI32(0);
    stats.sfcTotalDelegated = BigInt.fromI32(0);
    stats.dexVolume = BigInt.fromI32(0).toBigDecimal();
    stats.dexSwapCount = BigInt.fromI32(0);
    stats.save();
  }
  
  return stats;
}

export function getOrCreateThreeDayStats(timestamp: BigInt): ThreeDayStats {
  const threeDayId = getThreeDayId(timestamp);
  let stats = ThreeDayStats.load(threeDayId);
  
  if (stats === null) {
    const startTimestamp = getThreeDayStartTimestamp(timestamp);
    stats = new ThreeDayStats(threeDayId);
    stats.startTimestamp = startTimestamp;
    stats.endTimestamp = startTimestamp.plus(BigInt.fromI32(SECONDS_PER_THREE_DAYS));
    stats.transactionCount = BigInt.fromI32(0);
    stats.activeAddresses = BigInt.fromI32(0);
    stats.totalValueLocked = BigInt.fromI32(0);
    stats.bridgeInflow = BigInt.fromI32(0);
    stats.bridgeOutflow = BigInt.fromI32(0);
    stats.sfcTotalStaked = BigInt.fromI32(0);
    stats.sfcTotalDelegated = BigInt.fromI32(0);
    stats.dexVolume = BigInt.fromI32(0).toBigDecimal();
    stats.dexSwapCount = BigInt.fromI32(0);
    stats.save();
  }
  
  return stats;
}

// Helper function to update all time period stats
export function updateAllStats(event: ethereum.Event): void {
  const timestamp = event.block.timestamp;
  
  // Get stats entities for all time periods
  const hourlyStats = getOrCreateHourlyStats(timestamp);
  const dailyStats = getOrCreateDailyStats(timestamp);
  const threeDayStats = getOrCreateThreeDayStats(timestamp);
  
  // Update transaction counts
  hourlyStats.transactionCount = hourlyStats.transactionCount.plus(BigInt.fromI32(1));
  dailyStats.transactionCount = dailyStats.transactionCount.plus(BigInt.fromI32(1));
  threeDayStats.transactionCount = threeDayStats.transactionCount.plus(BigInt.fromI32(1));
  
  // Update active addresses (unique senders)
  let addresses = new Set<string>();
  addresses.add(event.transaction.from.toHexString());
  if (event.transaction.to) {
    addresses.add(event.transaction.to.toHexString());
  }
  
  hourlyStats.activeAddresses = hourlyStats.activeAddresses.plus(BigInt.fromI32(addresses.size));
  dailyStats.activeAddresses = dailyStats.activeAddresses.plus(BigInt.fromI32(addresses.size));
  threeDayStats.activeAddresses = threeDayStats.activeAddresses.plus(BigInt.fromI32(addresses.size));
  
  // Save updated stats
  hourlyStats.save();
  dailyStats.save();
  threeDayStats.save();
}
