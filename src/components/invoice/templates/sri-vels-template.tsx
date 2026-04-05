'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { type InvoiceFormValues } from '@/types/invoice';

type TemplateProps = {
  data: InvoiceFormValues;
};

export const SriVelsTemplate = ({ data }: TemplateProps) => {
    const subtotal = data.items.reduce((acc, item) => {
        const quantity = isNaN(Number(item.quantity)) ? 1 : Number(item.quantity);
        const price = isNaN(Number(item.price)) ? 0 : Number(item.price);
        return acc + quantity * price;
    }, 0);
    const discountAmount = subtotal * ((Number(data.discountRate) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.taxRate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;
    const depositAmount = data.includeDeposit ? (Number(data.depositAmount) || 0) : 0;
    const balanceDue = total - depositAmount;


    const formatCurrency = (amount: number | string) => {
        const num = Number(amount);
        if (isNaN(num)) return amount.toString();
        return 'RM' + num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const safeData = {
        ...data,
        invoiceNumber: data.invoiceNumber || 'INV-000000',
        fromName: data.fromName || 'Your Company',
        fromRegNo: data.fromRegNo,
        fromAddress: data.fromAddress || '123 Main St, Anytown, USA',
        toName: data.toName || 'Client Company',
        toAddress: data.toAddress || '456 Client Ave, Anytown, USA',
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        notes: data.notes || '',
        items: data.items.length > 0 && data.items.some(i => i.description) 
            ? data.items 
            : [{description: 'Example Item', quantity: 1, price: 100}],
        taxRate: Number(data.taxRate) || 0,
        discountRate: Number(data.discountRate) || 0,
    };

    return (
        <div className="text-primary flex flex-col p-4 sm:p-8 md:p-12 text-[9px] sm:text-[10px] md:text-xs">
            {/* Header */}
            <header className="flex justify-between items-start mb-10 pb-6 border-b-2 border-primary">
                <div>
                    <h2 className="font-bold text-lg uppercase tracking-tight mb-1">{safeData.fromName}</h2>
                    {safeData.fromRegNo && <span className="text-sm text-muted-foreground font-semibold mb-3 block">Registration No: {safeData.fromRegNo}</span>}
                    <div className="text-muted-foreground whitespace-pre-line">{safeData.fromAddress}</div>
                    {safeData.fromEmail && <div className="text-muted-foreground">{safeData.fromEmail}</div>}
                </div>
                <div className="text-right">
                    <h1 className="font-bold text-2xl md:text-3xl uppercase tracking-wider mb-4">Invoice</h1>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="text-muted-foreground pr-4 text-right">Invoice Number</td>
                                <td className="font-semibold text-right">{safeData.invoiceNumber}</td>
                            </tr>
                            <tr>
                                <td className="text-muted-foreground pr-4 text-right">Invoice Date</td>
                                <td className="font-semibold text-right">{format(safeData.invoiceDate, 'dd MMM yyyy')}</td>
                            </tr>
                            <tr>
                                <td className="text-muted-foreground pr-4 text-right">Due Date</td>
                                <td className="font-semibold text-right">{format(safeData.dueDate, 'dd MMM yyyy')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </header>

            {/* Billing */}
            <section className="grid grid-cols-2 gap-8 mb-8">
                 <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 pb-1 border-b">Bill To</div>
                    <div className="font-semibold text-base">{safeData.toName}</div>
                    <div className="text-muted-foreground whitespace-pre-line">{safeData.toAddress}</div>
                     {safeData.toEmail && <div className="text-muted-foreground">{safeData.toEmail}</div>}
                </div>
            </section>

            {/* Table */}
            <div className="flex-grow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left py-2 border-y border-primary font-semibold text-xs uppercase tracking-wider">Service / Description</th>
                            <th className="text-right py-2 border-y border-primary font-semibold text-xs uppercase tracking-wider w-20">Quantity</th>
                            <th className="text-right py-2 border-y border-primary font-semibold text-xs uppercase tracking-wider w-24">Unit Price</th>
                            <th className="text-right py-2 border-y border-primary font-semibold text-xs uppercase tracking-wider w-28">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeData.items.map((item, index) => {
                             const isNumeric = !isNaN(Number(item.quantity)) && !isNaN(Number(item.price));
                             const itemTotal = isNumeric ? (Number(item.quantity) * Number(item.price)) : 0;
                             return (
                                <tr key={index}>
                                    <td className="py-3 border-b border-border/50">
                                        <div className="font-semibold">{item.description || '...'}</div>
                                    </td>
                                    <td className="py-3 border-b border-border/50 text-right">{item.quantity}</td>
                                    <td className="py-3 border-b border-border/50 text-right">{isNumeric ? formatCurrency(item.price) : '-'}</td>
                                    <td className="py-3 border-b border-border/50 text-right font-semibold">{isNumeric ? formatCurrency(itemTotal) : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-8 flex justify-end">
                 <table className="w-[250px]">
                    <tbody>
                        <tr>
                            <td className="py-2 text-muted-foreground">Subtotal</td>
                            <td id="subtotalAmount" className='text-right font-semibold'>{formatCurrency(subtotal)}</td>
                        </tr>
                         {safeData.discountRate > 0 && (
                            <tr>
                                <td className="py-2 text-muted-foreground">Discount ({safeData.discountRate}%)</td>
                                <td className='text-right font-semibold'>-{formatCurrency(discountAmount)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="py-2 text-muted-foreground">Tax ({safeData.taxRate}%)</td>
                            <td id="taxAmount" className='text-right font-semibold'>{formatCurrency(taxAmount)}</td>
                        </tr>
                        <tr className="font-semibold">
                            <td className="py-2 border-t border-border">Total</td>
                            <td className='text-right border-t border-border'>{formatCurrency(total)}</td>
                        </tr>
                        {depositAmount > 0 && (
                            <tr className="font-semibold text-muted-foreground">
                                <td className="py-2">Deposit Paid</td>
                                <td className='text-right'>-{formatCurrency(depositAmount)}</td>
                            </tr>
                        )}
                        <tr className="font-bold text-base">
                            <td className="py-3 border-y-2 border-primary">{depositAmount > 0 ? 'Balance Due' : 'Grand Total'}</td>
                            <td id="grandTotalAmount" className='text-right border-y-2 border-primary'>{formatCurrency(balanceDue)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 pb-1 border-b">Payment Details</div>
                        {safeData.paymentDetails && (
                           <div className="text-sm space-y-1">
                               <p><span className="text-muted-foreground w-[110px] inline-block">Bank Name:</span> <strong className="font-semibold">{safeData.paymentDetails.bankName}</strong></p>
                               <p><span className="text-muted-foreground w-[110px] inline-block">Account Name:</span> <strong className="font-semibold">{safeData.paymentDetails.accountName}</strong></p>
                               <p><span className="text-muted-foreground w-[110px] inline-block">Account No:</span> <strong className="font-semibold">{safeData.paymentDetails.accountNumber}</strong></p>
                               <p><span className="text-muted-foreground w-[110px] inline-block">Method:</span> <strong className="font-semibold">{safeData.paymentDetails.paymentMethod}</strong></p>
                           </div>
                        )}
                    </div>
                     <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 pb-1 border-b">Notes</div>
                        <div className="text-muted-foreground text-sm whitespace-pre-line">
                           {safeData.notes}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
