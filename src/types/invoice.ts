import * as z from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.any().refine(value => {
    if (typeof value === 'string' && value.trim() !== '') return true;
    if (typeof value === 'number') return true;
    return value !== null && value !== undefined;
  }, {
    message: 'Quantity is required.',
  }),
  price: z.any().refine(value => {
    if (typeof value === 'string' && value.trim() !== '') return true;
    if (typeof value === 'number') return true;
    return value !== null && value !== undefined;
  }, {
    message: 'Price is required.',
  }),
});

export const invoiceFormSchema = z.object({
  documentType: z.enum(['invoice', 'receipt', 'deposit']).default('invoice'),
  template: z.enum(['default', 'sri-vels', 'editorial']).default('editorial'),
  invoiceNumber: z.string().min(1, 'Number is required'),
  fromName: z.string().min(1, '"From" name is required'),
  fromRegNo: z.string().optional(),
  fromEmail: z.string().email().optional().or(z.literal('')),
  fromAddress: z.string().min(1, '"From" address is required'),
  toName: z.string().min(1, '"To" name is required'),
  toEmail: z.string().email().optional().or(z.literal('')),
  toAddress: z.string().min(1, '"To" address is required'),
  invoiceDate: z.date({ required_error: "Date is required." }),
  dueDate: z.date().optional(),
  amountPaid: z.coerce.number().optional().default(0),
  items: z.array(lineItemSchema).min(1, 'Please add at least one item.'),
  notes: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discountRate: z.coerce.number().min(0).max(100).optional().default(0),
  paymentDetails: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    paymentMethod: z.string().optional(),
  }).optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
