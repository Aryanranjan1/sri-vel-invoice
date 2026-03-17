'use server';
/**
 * @fileOverview An AI-powered invoice data extraction engine.
 *
 * - extractInvoiceData - A function that converts messy, unstructured user input into structured invoice data.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ExtractInvoiceDataInputSchema = z.object({
  unstructuredData: z.string().describe('The raw, unstructured text to be parsed into invoice data.'),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const InvoiceItemSchema = z.object({
    name: z.string().describe('The name or description of the line item.'),
    quantity: z.number().describe('The quantity of the item. Defaults to 1 if not specified.'),
    price: z.number().describe('The price per unit of the item. Defaults to 0 if not specified.'),
});

const InvoiceSchema = z.object({
    date: z.string().describe('The date of the invoice, formatted as YYYY-MM-DD.').optional(),
    title: z.string().describe('A title for the invoice, like "Lunch" or "Dinner".').optional(),
    clientName: z.string().describe('The name of the client or customer.').optional(),
    items: z.array(InvoiceItemSchema).describe('An array of line items on the invoice.'),
    total: z.number().describe('The final total amount of the invoice.').optional(),
    notes: z.string().describe('Any additional notes or raw text from the invoice.').optional(),
    missingFields: z.array(z.string()).describe('An array of strings indicating which critical fields were not found in the input.'),
});

export const ExtractInvoiceDataOutputSchema = z.object({
  invoices: z.array(InvoiceSchema),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;


export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

const extractionPrompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an advanced invoice data extraction engine.

Your task is to convert messy, unstructured user input into structured invoice data.

---

## CORE RULES

* Output ONLY valid JSON that conforms to the output schema.
* Do NOT include any explanation or extra text.
* Do NOT wrap the JSON in markdown.
* Always return an "invoices" array, even if the input seems empty.
* Never return an empty or undefined output.

---

## OBJECTIVE

* Detect how many distinct invoices exist in the input text.
* Split the input into multiple invoice blocks if necessary (e.g., based on spacing, dates, or repeated structures).
* Extract structured data from each block.

---

## EXTRACTION LOGIC & SCHEMA

For each invoice detected, extract the following fields:

*   **date**: string (Format as YYYY-MM-DD. For example, "24/3" or "March 24, 2024" should become "2024-03-24").
*   **title**: string (A general title like "Lunch" or "Dinner" if present).
*   **clientName**: string (The name of the person or company being invoiced, e.g., "PJ Temple").
*   **items**: array of objects, where each object has:
    *   **name**: string (The name of the menu item or service).
    *   **quantity**: number (Default to 1 if not specified).
    *   **price**: number (The price for a single unit. Default to 0 if no per-item price is found).
*   **total**: number (The final total amount. Extract from patterns like "Tt$670" or "Total 600").
*   **notes**: string (Include any additional text, comments, or the raw menu list if it provides context).
*   **missingFields**: array of strings. Add the corresponding field name to this array if it's missing:
    *   "clientName" if no client name is found.
    *   "itemPricing" if no prices for any items are found.
    *   "total" if no total amount is found.
    *   "date" if no date is found.

---
## DEFAULTS

* If quantity is not mentioned for an item, it is **1**.
* If a price is not specified for an item, its price is **0**.
* If a string field is not found, it should be an empty string "" or omitted.

---
## IMPORTANT

* Be aggressive and creative in parsing messy, inconsistent input. Your goal is to extract structure from chaos.
* Do not fail if the formatting is weird. Always return your best attempt at a structured result.

---
USER INPUT TO PROCESS:
\`\`\`
{{{unstructuredData}}}
\`\`\`
`,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async (input) => {
    const {output} = await extractionPrompt(input);
    if (!output) {
      // Fallback to ensure we never return empty output, as per user rules.
      return { invoices: [] };
    }
    return output;
  }
);
