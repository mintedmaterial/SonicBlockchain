import { BigInt, Address } from '@graphprotocol/graph-ts';
import { Transfer as TransferEvent, Approval as ApprovalEvent } from '../generated/USDC/ERC20';
import { TokenTransfer, TokenApproval } from '../generated/schema';
import { createTransaction, generateId } from './utils';

export function handleTokenTransfer(event: TransferEvent): void {
  const transfer = new TokenTransfer(generateId(event));
  transfer.token = event.address;
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.value = event.params.value;
  transfer.transaction = createTransaction(event).id;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.save();
}

export function handleTokenApproval(event: ApprovalEvent): void {
  const approval = new TokenApproval(generateId(event));
  approval.token = event.address;
  approval.owner = event.params.owner;
  approval.spender = event.params.spender;
  approval.value = event.params.value;
  approval.transaction = createTransaction(event).id;
  approval.timestamp = event.block.timestamp;
  approval.blockNumber = event.block.number;
  approval.save();
}
