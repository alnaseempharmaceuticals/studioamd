'use server';

/**
 * @fileOverview Formats an invoice using AI to create a visually appealing and well-structured table.
 *
 * - formatInvoice - A function that accepts customer details and invoice items, then uses AI to format the invoice.
 * - InvoiceInput - The input type for the formatInvoice function.
 * - InvoiceOutput - The return type for the formatInvoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvoiceItemSchema = z.object({
  name: z.string().describe('The name of the item.'),
  quantity: z.number().describe('The quantity of the item.'),
  unitPrice: z.number().describe('The unit price of the item.'),
});

const InvoiceInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  items: z.array(InvoiceItemSchema).describe('An array of invoice items.'),
  amountReceived: z.number().describe('The amount received from the customer.'),
  invoiceNumber: z.number().describe('The unique invoice number.'),
});

export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

const InvoiceOutputSchema = z.object({
  formattedInvoice: z.string().describe('The formatted invoice in a well-structured table.'),
  balanceDue: z.number().describe('The remaining balance due on the invoice.'),
});

export type InvoiceOutput = z.infer<typeof InvoiceOutputSchema>;

export async function formatInvoice(input: InvoiceInput): Promise<InvoiceOutput> {
  return formatInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatInvoicePrompt',
  input: {schema: InvoiceInputSchema},
  output: {schema: InvoiceOutputSchema},
  prompt: `You are an AI assistant specialized in formatting invoices into visually appealing and well-structured tables. Given the customer's name, a list of items with their details (name, quantity, unit price), the amount received, and the invoice number, generate a markdown table representing the invoice. Also, calculate the total amount, and compute the balance due. Do not include the 'type' field in the output table.

Customer Name: {{{customerName}}}
Invoice Number: {{{invoiceNumber}}}

Items:
{{#each items}}
Name: {{{this.name}}}, Quantity: {{{this.quantity}}}, Unit Price: {{{this.unitPrice}}}
{{/each}}

Amount Received: {{{amountReceived}}}

Output the formatted invoice as a markdown table with columns for Item Name, Quantity, Unit Price, and Total. Calculate the total cost for each item. Then, show the overall total, the amount received, and the balance due. Make sure it is well structured and easy to read.
`,
});

const formatInvoiceFlow = ai.defineFlow(
  {
    name: 'formatInvoiceFlow',
    inputSchema: InvoiceInputSchema,
    outputSchema: InvoiceOutputSchema,
  },
  async input => {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const balanceDue = totalAmount - input.amountReceived;
    
    const {output} = await prompt(input);

    return {
      formattedInvoice: output!.formattedInvoice,
      balanceDue: balanceDue,
    };
  }
);
