'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { type InvoiceFormValues } from '@/types/invoice';

type TemplateProps = {
  data: InvoiceFormValues;
};

export const ReceiptTemplate = ({ data }: TemplateProps) => {
    const subtotal = data.items.reduce((acc, item) => {
        const quantity = isNaN(Number(item.quantity)) ? 1 : Number(item.quantity);
        const price = isNaN(Number(item.price)) ? 0 : Number(item.price);
        return acc + quantity * price;
    }, 0);
    const discountAmount = subtotal * ((Number(data.discountRate) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.taxRate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;
    
    const amountPaid = (data.amountPaid !== undefined && data.amountPaid !== null && !isNaN(Number(data.amountPaid)) && String(data.amountPaid).trim() !== '' && Number(data.amountPaid) > 0)
      ? Number(data.amountPaid)
      : total;
    const balanceDue = total - amountPaid;

    const formatCurrency = (amount: number | string) => {
        const num = Number(amount);
        if (isNaN(num)) return amount.toString();
        return 'RM' + num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const safeData = {
        ...data,
        invoiceNumber: data.invoiceNumber || 'REC-000000',
        fromName: data.fromName || 'Your Company',
        fromAddress: data.fromAddress || '123 Main St, Anytown, USA',
        toName: data.toName || 'Client Company',
        toAddress: data.toAddress || '456 Client Ave, Anytown, USA',
        invoiceDate: data.invoiceDate || new Date(),
        items: data.items.length > 0 && data.items.some(i => i.description) 
            ? data.items 
            : [],
    };

    return (
        <div className="text-primary flex flex-col p-4 sm:p-8 md:p-12 text-[9px] sm:text-[10px] md:text-xs bg-card">
            {/* Header */}
            <header className="flex justify-between items-start mb-10 md:mb-16">
                <div>
                    <h2 className="font-semibold text-base md:text-lg mb-1">{safeData.fromName}</h2>
                    {safeData.fromRegNo && <p className="text-muted-foreground text-[0.9em] mb-2">{safeData.fromRegNo}</p>}
                    <p className="text-muted-foreground whitespace-pre-line text-[0.9em]">{safeData.fromAddress}</p>
                    {safeData.fromEmail && <p className="text-muted-foreground text-[0.9em]">{safeData.fromEmail}</p>}
                </div>
                <div className="text-right">
                    <h1 className="font-light text-xl md:text-3xl mb-2 md:mb-4 text-primary/80">Receipt</h1>
                    <div className="grid grid-cols-[auto_auto] gap-x-2 md:gap-x-4 gap-y-1 text-sm">
                        <span className="text-muted-foreground">Receipt No.</span>
                        <span className="font-medium">{safeData.invoiceNumber}</span>
                        <span className="text-muted-foreground">Date Paid</span>
                        <span className="font-medium">{format(safeData.invoiceDate, 'dd MMM yyyy')}</span>
                    </div>
                </div>
            </header>

            {/* Billing */}
            <section className="mb-10 md:mb-12">
                <h3 className="text-[0.8em] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Received From</h3>
                <p className="font-medium text-base">{safeData.toName}</p>
                <p className="text-muted-foreground whitespace-pre-line">{safeData.toAddress}</p>
                {safeData.toEmail && <p className="text-muted-foreground">{safeData.toEmail}</p>}
            </section>

            {/* Table */}
            <div className="flex-grow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left pb-2 md:pb-3 border-b-2 font-medium text-muted-foreground uppercase tracking-wider text-[0.8em]">Description</th>
                            <th className="text-right pb-2 md:pb-3 border-b-2 font-medium text-muted-foreground uppercase tracking-wider text-[0.8em] w-16 md:w-20">Qty</th>
                            <th className="text-right pb-2 md:pb-3 border-b-2 font-medium text-muted-foreground uppercase tracking-wider text-[0.8em] w-20 md:w-24">Unit Price</th>
                            <th className="text-right pb-2 md:pb-3 border-b-2 font-medium text-muted-foreground uppercase tracking-wider text-[0.8em] w-24 md:w-28">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeData.items.map((item, index) => {
                            const isNumeric = !isNaN(Number(item.quantity)) && !isNaN(Number(item.price));
                            const itemTotal = isNumeric ? (Number(item.quantity) * Number(item.price)) : 0;
                             return (
                                <tr key={index}>
                                    <td className="py-2 md:py-3 border-b font-medium">{item.description || '...'}</td>
                                    <td className="py-2 md:py-3 border-b text-right text-muted-foreground">{item.quantity}</td>
                                    <td className="py-2 md:py-3 border-b text-right text-muted-foreground">{isNumeric ? formatCurrency(item.price) : '-'}</td>
                                    <td className="py-2 md:py-3 border-b text-right font-medium">{isNumeric ? formatCurrency(itemTotal) : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-8 ml-auto w-full max-w-[280px]">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    {safeData.discountRate > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount ({safeData.discountRate}%)</span><span>-{formatCurrency(discountAmount)}</span></div>}
                    <div className="flex justify-between text-muted-foreground"><span>Tax ({safeData.taxRate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    <div className="flex justify-between font-semibold text-base text-muted-foreground"><span>Amount Paid</span><span>{formatCurrency(amountPaid)}</span></div>
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between font-semibold text-base"><span>Balance Due</span><span>{formatCurrency(balanceDue)}</span></div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-6 md:pt-8 border-t text-muted-foreground text-[0.9em]">
                <p>Thank you for your business!</p>
            </footer>
        </div>
    );
};
