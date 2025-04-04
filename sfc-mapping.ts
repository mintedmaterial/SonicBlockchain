import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  Delegated as DelegatedEvent,
  Undelegated as UndelegatedEvent,
  ClaimedRewards as ClaimedRewardsEvent,
  LockedUp as LockedUpEvent
} from '../generated/SFC/SFC';
import {
  SFCDelegation,
  SFCUndelegation,
  SFCClaimedRewards,
  SFCLockedUp
} from '../generated/schema';
import { createTransaction } from './utils';

export function handleDelegated(event: DelegatedEvent): void {
  const delegation = new SFCDelegation(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  delegation.delegator = event.params.delegator;
  delegation.toValidatorId = event.params.toValidatorID;
  delegation.amount = event.params.amount;
  delegation.timestamp = event.block.timestamp;
  delegation.transaction = createTransaction(event).id;
  delegation.save();
}

export function handleUndelegated(event: UndelegatedEvent): void {
  const undelegation = new SFCUndelegation(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  undelegation.delegator = event.params.delegator;
  undelegation.toValidatorId = event.params.toValidatorID;
  undelegation.wrID = event.params.wrID;
  undelegation.amount = event.params.amount;
  undelegation.timestamp = event.block.timestamp;
  undelegation.transaction = createTransaction(event).id;
  undelegation.save();
}

export function handleClaimedRewards(event: ClaimedRewardsEvent): void {
  const claimedRewards = new SFCClaimedRewards(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  claimedRewards.delegator = event.params.delegator;
  claimedRewards.toValidatorId = event.params.toValidatorID;
  claimedRewards.amount = event.params.amount;
  claimedRewards.timestamp = event.block.timestamp;
  claimedRewards.transaction = createTransaction(event).id;
  claimedRewards.save();
}

export function handleLockedUp(event: LockedUpEvent): void {
  const lockedUp = new SFCLockedUp(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  lockedUp.delegator = event.params.delegator;
  lockedUp.toValidatorId = event.params.toValidatorID;
  lockedUp.duration = event.params.duration;
  lockedUp.amount = event.params.amount;
  lockedUp.timestamp = event.block.timestamp;
  lockedUp.transaction = createTransaction(event).id;
  lockedUp.save();
}
