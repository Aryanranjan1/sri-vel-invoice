'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { type InvoiceFormValues } from '@/types/invoice';

type TemplateProps = {
  data: InvoiceFormValues;
};

export const EditorialDepositTemplate = ({ data }: TemplateProps) => {
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
        : (data.documentType !== 'invoice' ? total : 0);
    const balanceDue = total - amountPaid;

    const formatCurrency = (amount: number | string) => {
        const num = Number(amount);
        if (isNaN(num)) return amount.toString();
        return 'RM' + num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const safeData = {
        ...data,
        invoiceNumber: data.invoiceNumber || 'DEP-000000',
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
        <div className="text-primary flex flex-col p-4 sm:p-8 md:p-12 text-[9px] sm:text-[10px] md:text-xs font-sans">
            {/* Header */}
            <header className="flex justify-between items-end mb-8">
                <div className="max-w-[60%]">
                    <h2 className="font-extrabold text-base uppercase tracking-tighter mb-1">{safeData.fromName}</h2>
                    <div className="text-muted-foreground text-[10px] uppercase tracking-wider leading-relaxed">
                        {safeData.fromRegNo && <p>Reg No: {safeData.fromRegNo}</p>}
                        <p className="whitespace-pre-line">{safeData.fromAddress}</p>
                        {safeData.fromEmail && <p>{safeData.fromEmail}</p>}
                    </div>
                </div>
                <div className="font-extrabold text-4xl tracking-tighter">DEPOSIT</div>
            </header>

            {/* Meta Band */}
            <section className="grid grid-cols-2 border-y-2 border-primary py-4 mb-8">
                <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold block mb-1">Deposit Number</span>
                    <span className="text-sm font-semibold">{safeData.invoiceNumber}</span>
                </div>
                <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold block mb-1">Date Received</span>
                    <span className="text-sm font-semibold">{format(safeData.invoiceDate, 'dd MMM yyyy')}</span>
                </div>
            </section>
            
            {/* Billing */}
            <section className="mb-10">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Deposit From</div>
                <div className="font-extrabold text-lg mb-1">{safeData.toName}</div>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {safeData.toAddress}
                  {safeData.toEmail && <br/>}
                  {safeData.toEmail}
                </div>
            </section>

            {/* Table */}
            <div className="flex-grow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left pb-3 border-b-2 border-primary font-extrabold text-xs uppercase tracking-widest">Description</th>
                            <th className="text-right pb-3 border-b-2 border-primary font-extrabold text-xs uppercase tracking-widest w-20">Qty</th>
                            <th className="text-right pb-3 border-b-2 border-primary font-extrabold text-xs uppercase tracking-widest w-28">Unit Price</th>
                            <th className="text-right pb-3 border-b-2 border-primary font-extrabold text-xs uppercase tracking-widest w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeData.items.map((item, index) => {
                             const isNumeric = !isNaN(Number(item.quantity)) && !isNaN(Number(item.price));
                             const itemTotal = isNumeric ? (Number(item.quantity) * Number(item.price)) : 0;
                             return (
                                <tr key={index}>
                                    <td className="py-4 border-b border-border/50 font-semibold text-sm">{item.description || '...'}</td>
                                    <td className="py-4 border-b border-border/50 text-right text-muted-foreground">{item.quantity}</td>
                                    <td className="py-4 border-b border-border/50 text-right text-muted-foreground">{isNumeric ? formatCurrency(item.price) : '-'}</td>
                                    <td className="py-4 border-b border-border/50 text-right font-semibold">{isNumeric ? formatCurrency(itemTotal) : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="mt-8 mb-12 flex justify-end">
                <div className="w-[280px]">
                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                     {safeData.discountRate > 0 && (
                        <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                            <span className="text-muted-foreground">Discount ({safeData.discountRate}%)</span>
                            <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                        <span className="text-muted-foreground">Tax ({safeData.taxRate}%)</span>
                        <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50 font-semibold text-sm">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 mt-2 bg-muted text-muted-foreground rounded-md">
                        <span className="font-extrabold text-base uppercase">Amount Paid</span>
                        <span className="font-extrabold text-base">{formatCurrency(amountPaid)}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 mt-2 bg-primary text-primary-foreground rounded-md">
                        <span className="font-extrabold text-base uppercase">Balance Due</span>
                        <span className="font-extrabold text-base">{formatCurrency(balanceDue)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-8 border-t-2 border-primary">
                 <div className="text-muted-foreground text-sm whitespace-pre-line">
                    Thank you for your business.
                </div>
            </footer>
        </div>
    );
};
