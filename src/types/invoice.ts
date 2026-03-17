import * as z from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  fromName: z.string().min(1, '"From" name is required'),
  fromEmail: z.string().email(),
  fromAddress: z.string().min(1, '"From" address is required'),
  toName: z.string().min(1, '"To" name is required'),
  toEmail: z.string().email(),
  toAddress: z.string().min(1, '"To" address is required'),
  invoiceDate: z.date({ required_error: "Invoice date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(lineItemSchema).min(1, 'Please add at least one item.'),
  notes: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discountRate: z.coerce.number().min(0).max(100).optional().default(0),
  template: z.enum(['modern', 'classic', 'minimal', 'sri-vels', 'editorial']).optional().default('modern'),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
