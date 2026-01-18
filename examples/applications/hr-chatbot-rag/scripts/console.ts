import repl from 'node:repl';
import { prisma } from '@/lib/db';
import { AssistantChat } from '@/models/assistant-chat';
import { llm } from '@/lib/node-llm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('--- HR Chatbot Console ---');
console.log('Available Globals:');
console.log('  - prisma (Database Client)');
console.log('  - AssistantChat (Domain Model)');
console.log('  - llm (NodeLLM Instance)');
console.log('---------------------------');

const r = repl.start('hr-chatbot > ');

// Attach our domain objects to the REPL context
// This makes them available as global variables in the session
Object.assign(r.context, {
  prisma,
  AssistantChat,
  llm
});
