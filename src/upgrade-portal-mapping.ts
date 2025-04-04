import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  UpgradeInitiated as UpgradeInitiatedEvent,
  UpgradeCompleted as UpgradeCompletedEvent
} from '../generated/FTMtoSUpgradePortal/UpgradePortal';
import { UpgradeInitiated, UpgradeCompleted } from '../generated/schema';
import { createTransaction, generateId } from './utils';

export function handleUpgradeInitiated(event: UpgradeInitiatedEvent): void {
  const upgrade = new UpgradeInitiated(generateId(event));
  upgrade.from = event.params.from;
  upgrade.amount = event.params.amount;
  upgrade.timestamp = event.block.timestamp;
  upgrade.blockNumber = event.block.number;
  upgrade.transaction = createTransaction(event).id;
  upgrade.save();
}

export function handleUpgradeCompleted(event: UpgradeCompletedEvent): void {
  const upgrade = new UpgradeCompleted(generateId(event));
  upgrade.to = event.params.to;
  upgrade.amount = event.params.amount;
  upgrade.timestamp = event.block.timestamp;
  upgrade.blockNumber = event.block.number;
  upgrade.transaction = createTransaction(event).id;
  upgrade.save();
}
