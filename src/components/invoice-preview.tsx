
'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type InvoiceFormValues } from '@/types/invoice';
import { SriVelsTemplate } from './sri-vels-template';
import { EditorialTemplate } from './editorial-template';


type InvoicePreviewProps = {
  data: InvoiceFormValues;
  template?: 'modern' | 'classic' | 'minimal' | 'sri-vels' | 'editorial';
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data, template = 'modern' }, ref) => {
    const cardWrapperClasses = "w-full mx-auto my-8 print:shadow-none print:border-none print:my-0 bg-card aspect-[210/297] flex flex-col overflow-hidden";

    if (template === 'sri-vels') {
        return (
            <Card ref={ref} className={cn(cardWrapperClasses)}>
                <SriVelsTemplate data={data} />
            </Card>
        );
    }
    if (template === 'editorial') {
        return (
            <Card ref={ref} className={cn(cardWrapperClasses)}>
                <EditorialTemplate data={data} />
            </Card>
        );
    }

    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
    const discountAmount = subtotal * ((Number(data.discountRate) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.taxRate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;

    const safeData = {
        ...data,
        invoiceNumber: data.invoiceNumber || 'INV-000000',
        fromName: data.fromName || 'Your Company',
        fromRegNo: data.fromRegNo || '',
        fromAddress: data.fromAddress || '123 Main St, Anytown, USA',
        fromEmail: data.fromEmail || '',
        toName: data.toName || 'Client Company',
        toAddress: data.toAddress || '456 Client Ave, Anytown, USA',
        toEmail: data.toEmail || '',
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        notes: data.notes || '',
        items: data.items.length > 0 ? data.items : [{description: 'Example Item', quantity: 1, price: 100}],
        taxRate: Number(data.taxRate) || 0,
        discountRate: Number(data.discountRate) || 0,
    };
    
    const formatPrice = (price: any) => {
        const num = Number(price);
        if (isNaN(num)) return price;
        return `RM${num.toFixed(2)}`;
    }

    return (
        <Card ref={ref} className={cn(
            "w-full mx-auto my-8 print:shadow-none print:border-none print:my-0 bg-card aspect-[210/297] text-sm flex flex-col",
            template === 'classic' && 'font-serif',
            template === 'minimal' && 'border-none shadow-none',
        )}>
            <CardHeader className={cn(
                "flex flex-row justify-between items-start p-6",
                template === 'classic' && "border-b-2 border-gray-800 pb-6 dark:border-gray-300"
            )}>
                <div>
                    <h1 className={cn(
                        "text-2xl font-bold font-headline",
                        template === 'classic' && "text-3xl",
                        template === 'minimal' && "text-xl font-semibold",
                    )}>Invoice</h1>
                    <p className="text-muted-foreground">#{safeData.invoiceNumber}</p>
                </div>
                <div className={cn(
                    "text-right",
                    template === 'minimal' && 'hidden'
                )}>
                    <p className="font-bold text-base">{safeData.fromName}</p>
                    {safeData.fromRegNo && <p className="text-muted-foreground text-xs">{safeData.fromRegNo}</p>}
                    <p className="text-muted-foreground text-xs whitespace-pre-line">{safeData.fromAddress}</p>
                    {safeData.fromEmail && <p className="text-muted-foreground text-xs">{safeData.fromEmail}</p>}
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col">
                <Separator className={cn("my-4", template === 'minimal' && 'hidden', template === 'classic' && 'border-gray-800 dark:border-gray-300')} />
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold mb-2">Bill To:</h3>
                        <p className="font-bold">{safeData.toName}</p>
                        <p className="text-muted-foreground whitespace-pre-line">{safeData.toAddress}</p>
                        {safeData.toEmail && <p className="text-muted-foreground">{safeData.toEmail}</p>}
                    </div>
                    <div className="text-right space-y-1">
                        <p><strong>Invoice Date:</strong> {format(safeData.invoiceDate, 'PPP')}</p>
                        <p><strong>Due Date:</strong> {format(safeData.dueDate, 'PPP')}</p>
                    </div>
                </div>

                <div className="flex-grow">
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
                                const isNumeric = !isNaN(Number(item.quantity)) && !isNaN(Number(item.price));
                                return (
                                    <TableRow key={index} className="last:border-b-0">
                                        <TableCell className="font-medium">{item.description || '...'}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                                        <TableCell className="text-right">{isNumeric ? `RM${itemTotal.toFixed(2)}` : '-'}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="mt-auto pt-6">
                    {safeData.notes && (
                        <>
                            <Separator className="my-6" />
                            <div>
                                <h3 className="font-semibold mb-2">Notes</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{safeData.notes}</p>
                            </div>
                        </>
                    )}
                    {safeData.paymentDetails && (safeData.paymentDetails.bankName || safeData.paymentDetails.accountName || safeData.paymentDetails.accountNumber) && (
                        <>
                            <Separator className="my-6" />
                            <div>
                                <h3 className="font-semibold mb-2">Payment Instructions</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {safeData.paymentDetails.bankName && <p><strong>Bank:</strong> {safeData.paymentDetails.bankName}</p>}
                                    {safeData.paymentDetails.accountName && <p><strong>Account Name:</strong> {safeData.paymentDetails.accountName}</p>}
                                    {safeData.paymentDetails.accountNumber && <p><strong>Account No:</strong> {safeData.paymentDetails.accountNumber}</p>}
                                    {safeData.paymentDetails.paymentMethod && <p><strong>Method:</strong> {safeData.paymentDetails.paymentMethod}</p>}
                                </div>
                            </div>
                        </>
                    )}
                    <Separator className="my-4" />

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>RM{subtotal.toFixed(2)}</span>
                            </div>
                            {safeData.discountRate > 0 && (
                                <div className="flex justify-between">
                                    <span>Discount ({safeData.discountRate}%):</span>
                                    <span className="text-red-500">-RM{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Tax ({safeData.taxRate}%):</span>
                                <span>RM{taxAmount.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>RM{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="p-6 mt-auto">
                 <p className="text-xs text-muted-foreground w-full text-center">Thank you for your business!</p>
            </CardFooter>
        </Card>
    );
  }
);
InvoicePreview.displayName = "InvoicePreview";
