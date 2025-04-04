import { BigInt, Address } from '@graphprotocol/graph-ts';
import { TokensTransferred as TokensTransferredEvent } from '../generated/Bridge/Bridge';
import { BridgeTransfer } from '../generated/schema';
import { createTransaction, generateId } from './utils';

export function handleTokensTransferred(event: TokensTransferredEvent): void {
  const transfer = new BridgeTransfer(generateId(event));
  transfer.tokenAddress = event.params.token;
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.amount = event.params.amount;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transaction = createTransaction(event).id;
  transfer.sourceChain = event.params.sourceChainId.toString();
  transfer.destinationChain = event.params.destinationChainId.toString();
  transfer.save();
}
