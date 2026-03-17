'use server';
/**
 * @fileOverview A Genkit flow for generating AI-assisted email replies to user contact messages.
 *
 * - adminAIAssistedReply - A function that generates an AI-assisted email reply.
 * - AdminAIAssistedReplyInput - The input type for the adminAIAssistedReply function.
 * - AdminAIAssistedReplyOutput - The return type for the adminAIAssistedReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminAIAssistedReplyInputSchema = z.object({
  userName: z.string().describe('The name of the user who sent the contact message.').default('User'),
  userEmail: z.string().email().describe('The email address of the user who sent the contact message.').default('user@example.com'),
  userMessage: z.string().describe('The original contact message from the user.').default('I have a question about my latest invoice.'),
  adminInstructions: z.string().optional().describe('Optional instructions or context for the AI to consider when drafting the reply. e.g., "Tell them we are working on the issue."'),
});
export type AdminAIAssistedReplyInput = z.infer<typeof AdminAIAssistedReplyInputSchema>;

const AdminAIAssistedReplyOutputSchema = z.object({
  subject: z.string().describe('A concise and relevant subject line for the email reply.'),
  body: z.string().describe('The drafted body of the email reply, professional and addressing the user\u0027s message.'),
});
export type AdminAIAssistedReplyOutput = z.infer<typeof AdminAIAssistedReplyOutputSchema>;

export async function adminAIAssistedReply(input: AdminAIAssistedReplyInput): Promise<AdminAIAssistedReplyOutput> {
  return adminAIAssistedReplyFlow(input);
}

const replyPrompt = ai.definePrompt({
  name: 'adminAIAssistedReplyPrompt',
  input: {schema: AdminAIAssistedReplyInputSchema},
  output: {schema: AdminAIAssistedReplyOutputSchema},
  prompt: `You are an AI assistant helping an administrator draft email replies to user contact messages for the "Invoice Platform" application.
The goal is to provide a quick, professional, and context-aware response.

User Details:
Name: {{{userName}}}
Email: {{{userEmail}}}
Original Message:
"""
{{{userMessage}}}
"""

{{#if adminInstructions}}
Administrator's Instructions/Context:
"""
{{{adminInstructions}}}
"""
{{/if}}

Please draft a polite and helpful email reply.
- Start the email with "Dear {{userName}},"
- Acknowledge their message.
- Address their concerns based on the original message and any administrator instructions.
- Maintain a professional and courteous tone.
- Conclude appropriately.
- Provide a concise subject line.

Draft the reply in JSON format with 'subject' and 'body' fields.
`,
});

const adminAIAssistedReplyFlow = ai.defineFlow(
  {
    name: 'adminAIAssistedReplyFlow',
    inputSchema: AdminAIAssistedReplyInputSchema,
    outputSchema: AdminAIAssistedReplyOutputSchema,
  },
  async (input) => {
    const {output} = await replyPrompt(input);
    if (!output) {
      throw new Error('Failed to generate AI-assisted reply.');
    }
    return output;
  }
);
