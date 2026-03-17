
'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// This should match the form values type from the new invoice page
export type InvoiceFormData = {
  invoiceNumber?: string;
  fromName?: string;
  fromEmail?: string;
  fromAddress?: string;
  toName?: string;
  toEmail?: string;
  toAddress?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  items: {
      description: string;
      quantity: number;
      price: number;
  }[];
  notes?: string;
  taxRate?: number;
  discountRate?: number;
  template?: string;
};

type InvoicePreviewProps = {
  data: InvoiceFormData;
  template?: string;
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data, template = 'modern' }, ref) => {
    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
    const discountAmount = subtotal * ((Number(data.discountRate) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.taxRate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;

    const safeData = {
        invoiceNumber: data.invoiceNumber || 'INV-000000',
        fromName: data.fromName || 'Your Company',
        fromAddress: data.fromAddress || '123 Main St, Anytown, USA',
        fromEmail: data.fromEmail || 'contact@yourcompany.com',
        toName: data.toName || 'Client Company',
        toAddress: data.toAddress || '456 Client Ave, Anytown, USA',
        toEmail: data.toEmail || 'contact@client.com',
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        notes: data.notes || '',
        items: data.items || [],
        taxRate: Number(data.taxRate) || 0,
        discountRate: Number(data.discountRate) || 0,
    };

    return (
        <Card ref={ref} className={cn(
            "w-full max-w-4xl mx-auto my-8 print:shadow-none print:border-none print:my-0 bg-card",
            template === 'classic' && 'font-serif',
            template === 'minimal' && 'border-none shadow-none',
        )}>
            <CardHeader className={cn(
                "flex flex-row justify-between items-start",
                template === 'classic' && "border-b-2 border-gray-800 pb-8 dark:border-gray-300"
            )}>
                <div>
                    <h1 className={cn(
                        "text-3xl font-bold font-headline",
                        template === 'classic' && "text-4xl",
                        template === 'minimal' && "text-2xl font-semibold",
                    )}>Invoice</h1>
                    <p className="text-muted-foreground">#{safeData.invoiceNumber}</p>
                </div>
                <div className={cn(
                    "text-right",
                    template === 'minimal' && 'hidden'
                )}>
                    <p className="font-bold text-lg">{safeData.fromName}</p>
                    <p className="text-muted-foreground">{safeData.fromAddress}</p>
                    <p className="text-muted-foreground">{safeData.fromEmail}</p>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className={cn("my-4", template === 'minimal' && 'hidden', template === 'classic' && 'border-gray-800 dark:border-gray-300')} />
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold mb-2">Bill To:</h3>
                        <p className="font-bold">{safeData.toName}</p>
                        <p className="text-muted-foreground">{safeData.toAddress}</p>
                        <p className="text-muted-foreground">{safeData.toEmail}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p><strong>Invoice Date:</strong> {format(safeData.invoiceDate, 'PPP')}</p>
                        <p><strong>Due Date:</strong> {format(safeData.dueDate, 'PPP')}</p>
                    </div>
                </div>

                <Table className={template === 'classic' ? 'border-y-2 border-gray-800 dark:border-gray-300' : ''}>
                    <TableHeader>
                        <TableRow className={cn(template === 'classic' && 'bg-gray-200 dark:bg-gray-700')}>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center w-[100px]">Quantity</TableHead>
                            <TableHead className="text-right w-[120px]">Price</TableHead>
                            <TableHead className="text-right w-[120px]">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {safeData.items.map((item, index) => {
                            const itemTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                            return (
                                <TableRow key={index} className="last:border-b-0">
                                    <TableCell className="font-medium">{item.description || '...'}</TableCell>
                                    <TableCell className="text-center">{Number(item.quantity) || 0}</TableCell>
                                    <TableCell className="text-right">${(Number(item.price) || 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${itemTotal.toFixed(2)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                
                <Separator className={cn("my-4", template === 'classic' && 'border-gray-800 dark:border-gray-300')} />

                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                         {safeData.discountRate > 0 && (
                             <div className="flex justify-between">
                                 <span>Discount ({safeData.discountRate}%):</span>
                                 <span className="text-red-500">-${discountAmount.toFixed(2)}</span>
                             </div>
                         )}
                        <div className="flex justify-between">
                            <span>Tax ({safeData.taxRate}%):</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {safeData.notes && (
                    <>
                        <Separator className="my-6" />
                        <div>
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-sm text-muted-foreground">{safeData.notes}</p>
                        </div>
                    </>
                )}

            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground w-full text-center">Thank you for your business!</p>
            </CardFooter>
        </Card>
    );
  }
);
InvoicePreview.displayName = "InvoicePreview";
