import * as z from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  // Allow string or number, but ensure it's not empty.
  quantity: z.any().refine(value => value !== '' && value !== null && value !== undefined, {
    message: 'Quantity is required.',
  }),
  price: z.any().refine(value => value !== '' && value !== null && value !== undefined, {
    message: 'Price is required.',
  }),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  fromName: z.string().min(1, '"From" name is required'),
  fromRegNo: z.string().optional(),
  fromEmail: z.string().optional(),
  fromAddress: z.string().min(1, '"From" address is required'),
  toName: z.string().min(1, '"To" name is required'),
  toEmail: z.string().optional(),
  toAddress: z.string().min(1, '"To" address is required'),
  invoiceDate: z.date({ required_error: "Invoice date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(lineItemSchema).min(1, 'Please add at least one item.'),
  notes: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discountRate: z.coerce.number().min(0).max(100).optional().default(0),
  template: z.enum(['modern', 'classic', 'minimal', 'sri-vels', 'editorial']).optional().default('modern'),
  paymentDetails: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    paymentMethod: z.string().optional(),
  }).optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
