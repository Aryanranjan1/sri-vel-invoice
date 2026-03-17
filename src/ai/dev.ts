'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/admin-ai-assisted-reply.ts';
import '@/ai/flows/extract-invoice-data.ts';
