'use server';
/**
 * @fileOverview An AI-powered invoice data extraction engine for a professional invoice generation system.
 *
 * - extractInvoiceData - A function that converts messy, unstructured user input into structured invoice data.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInvoiceDataInputSchema = z.object({
  unstructuredData: z.string().describe('The raw, unstructured text to be parsed into invoice data.'),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const InvoiceItemSchema = z.object({
    name: z.string().describe('The name or description of the line item. Keep it concise for A4 formatting.'),
    quantity: z.number().describe('The quantity of the item. Defaults to 1 if not specified.'),
    price: z.number().describe('The price per unit of the item. Defaults to 0 if not specified.'),
});

const InvoiceSchema = z.object({
    date: z.string().describe('The date of the invoice, formatted as YYYY-MM-DD.').optional(),
    title: z.string().describe('A title for the invoice, like "Lunch" or "Event Type".').optional(),
    clientName: z.string().describe('The name of the client or customer.').optional(),
    currency: z.string().describe('The currency code for the invoice amounts. Should be "MYR".').optional(),
    items: z.array(InvoiceItemSchema).describe('An array of line items on the invoice.'),
    total: z.number().describe('The final total amount of the invoice, as a numeric value.').optional(),
    notes: z.string().describe('Any additional notes, raw text, or full menu details from the invoice.').optional(),
    missingFields: z.array(z.string()).describe('An array of strings indicating which critical fields were not found in the input.'),
});

const ExtractInvoiceDataOutputSchema = z.object({
  invoices: z.array(InvoiceSchema).describe('An array of detected invoices.'),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;


export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

const extractionPrompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an advanced invoice data extraction engine for a professional invoice generation system.
Your task is to convert messy, unstructured user input into structured invoice data suitable for generating clean A4-sized invoices.

---

## CORE RULES (MANDATORY)

*   Output ONLY valid JSON that conforms to the output schema.
*   Do NOT include any explanation or extra text.
*   Do NOT wrap the JSON in markdown.
*   Always return an "invoices" array, even if the input is empty.
*   Never return an empty or undefined output.

---

## OBJECTIVE

*   Detect how many distinct invoices exist in the input.
*   Split the input into multiple invoice blocks if necessary (based on spacing, dates, or structure).
*   Extract structured data from each block.
*   Prepare the data to be suitable for clean A4 invoice rendering.

---

## EXTRACTION LOGIC

*   Each logical section should be treated as one invoice.
*   Extract the following fields:
    *   **date**: Normalize formats like "24/3" to a consistent format (e.g., YYYY-MM-DD).
    *   **title**: Extract event types like "Lunch" or "Dinner".
    *   **clientName**: The name of the person or company being invoiced (e.g., "PJ Temple").
    *   **items**: If a menu list is provided, treat each entry as an item.
    *   **total**: Extract from patterns like "Tt$670" or "Total 600".
    *   **notes**: Include the full raw menu or any additional text for reference.

---

## CURRENCY RULE (STRICT)

*   Always set the **currency** field to **"MYR"** (Malaysian Ringgit).
*   Remove currency symbols like "$" or "Tt$" from all extracted numeric values (total, price).
*   Convert all extracted totals and prices into numeric values only.
    *   Example: "Tt$670" should result in \`"total": 670\`.

---

## A4 STRUCTURE OPTIMIZATION

Prepare data so it fits cleanly into an A4 invoice layout:

*   Keep item names concise.
*   Avoid duplicating large blocks of text in both items and notes.
*   Move full menu details into the "notes" field if they are too long for a table row.
*   Ensure the item list remains readable for a table format.

---

## MISSING FIELD DETECTION

Add the corresponding field name to the "missingFields" array if:
*   "clientName" is not found.
*   "itemPricing" is not found (i.e., no prices for any items).
*   "total" is not found.
*   "date" is not found.

---

## DEFAULT VALUES

*   **quantity**: Default to 1 if not specified.
*   **price**: Default to 0 if an item price is not specified.
*   **string fields**: Default to an empty string "" if not found.

---

## FINAL OUTPUT REQUIREMENT

The JSON must be clean, structured, and directly usable for A4 PDF generation, multi-invoice rendering, and populating editable UI forms.

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
