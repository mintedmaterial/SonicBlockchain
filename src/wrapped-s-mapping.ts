import { BigInt, Address } from '@graphprotocol/graph-ts';
import { Transfer as TransferEvent, Approval as ApprovalEvent } from '../generated/WrappedS/ERC20';
import { WSTransfer, WSApproval } from '../generated/schema';
import { createTransaction, generateId } from './utils';

export function handleWSTransfer(event: TransferEvent): void {
  const transfer = new WSTransfer(generateId(event));
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.value = event.params.value;
  transfer.transaction = createTransaction(event).id;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.save();
}

export function handleWSApproval(event: ApprovalEvent): void {
  const approval = new WSApproval(generateId(event));
  approval.owner = event.params.owner;
  approval.spender = event.params.spender;
  approval.value = event.params.value;
  approval.transaction = createTransaction(event).id;
  approval.timestamp = event.block.timestamp;
  approval.blockNumber = event.block.number;
  approval.save();
}
