import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Transaction } from '../generated/schema';

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

export function getTimestampInDays(timestamp: BigInt): number {
  // Convert timestamp to day
  const secondsPerDay = 86400;
  return timestamp.toI32() / secondsPerDay;
}

export function getDayId(timestamp: BigInt): string {
  const day = getTimestampInDays(timestamp);
  return day.toString();
}

export function getDayStartTimestamp(timestamp: BigInt): BigInt {
  const secondsPerDay = 86400;
  const dayIndex = timestamp.toI32() / secondsPerDay;
  return BigInt.fromI32(dayIndex * secondsPerDay);
}

export function getOrCreateDailyStats(timestamp: BigInt): void {
  const dayID = getDayId(timestamp);
  
  // Implementation for DailyStats would go here if needed
  // This could track total transactions per day, total value locked, etc.
}
