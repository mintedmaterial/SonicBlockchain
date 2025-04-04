import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  MessageSent as MessageSentEvent,
  MessageExecuted as MessageExecutedEvent
} from '../generated/MessageBus/MessageBus';
import { MessageSent, MessageExecuted } from '../generated/schema';
import { createTransaction, generateId } from './utils';

export function handleMessageSent(event: MessageSentEvent): void {
  const messageSent = new MessageSent(generateId(event));
  messageSent.sender = event.params.sender;
  messageSent.receiver = event.params.receiver;
  messageSent.srcChainId = event.params.srcChainId;
  messageSent.dstChainId = event.params.dstChainId;
  messageSent.message = event.params.message;
  messageSent.timestamp = event.block.timestamp;
  messageSent.blockNumber = event.block.number;
  messageSent.transaction = createTransaction(event).id;
  messageSent.save();
}

export function handleMessageExecuted(event: MessageExecutedEvent): void {
  const messageExecuted = new MessageExecuted(generateId(event));
  messageExecuted.sender = event.params.sender;
  messageExecuted.executor = event.params.executor;
  messageExecuted.srcChainId = event.params.srcChainId;
  messageExecuted.dstChainId = event.params.dstChainId;
  messageExecuted.message = event.params.message;
  messageExecuted.timestamp = event.block.timestamp;
  messageExecuted.blockNumber = event.block.number;
  messageExecuted.transaction = createTransaction(event).id;
  messageExecuted.save();
}
