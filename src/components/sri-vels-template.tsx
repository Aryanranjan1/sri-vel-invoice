'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { type InvoiceFormValues } from '@/types/invoice';

type SriVelsTemplateProps = {
  data: InvoiceFormValues;
};

export const SriVelsTemplate: React.FC<SriVelsTemplateProps> = ({ data }) => {
    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
    const discountAmount = subtotal * ((Number(data.discountRate) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.taxRate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;

    const formatCurrency = (amount: number) => {
        return 'RM ' + amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    
    const formatPrice = (price: any) => {
        const num = Number(price);
        if (isNaN(num)) return price;
        return formatCurrency(num);
    }

    const safeData = {
        ...data,
        invoiceNumber: data.invoiceNumber || 'INV-000',
        fromName: data.fromName || 'Your Company',
        fromRegNo: data.fromRegNo,
        fromAddress: data.fromAddress || '123 Main St\nAnytown, USA',
        fromEmail: data.fromEmail,
        toName: data.toName || 'Client Company',
        toAddress: data.toAddress || '456 Client Ave\nClient City, USA',
        toEmail: data.toEmail,
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        items: data.items.length > 0 ? data.items : [{ description: 'Example Service', quantity: '1', price: '100.00' }],
        notes: data.notes || '',
        taxRate: Number(data.taxRate) || 0,
        discountRate: Number(data.discountRate) || 0,
    };
    
    return (
        <div className="bg-white text-black font-body text-[12px] leading-normal w-full h-full p-6 flex flex-col print:p-0">
            <header className="flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
                <div className="flex-1">
                    <div className="text-lg font-bold uppercase tracking-wide">{safeData.fromName}</div>
                    {safeData.fromRegNo && <div className="text-xs text-gray-600 mb-2">{safeData.fromRegNo}</div>}
                    <div className="text-xs text-gray-800 whitespace-pre-line">
                        {safeData.fromAddress}
                        {safeData.fromEmail && <>{'\n'}{safeData.fromEmail}</>}
                    </div>
                </div>
                <div className="text-right flex-shrink-0 ml-8">
                    <div className="text-3xl font-bold uppercase tracking-[2px] mb-4">Invoice</div>
                    <table className="w-full text-xs">
                        <tbody>
                            <tr>
                                <td className="pr-5 text-gray-600 text-right">Invoice Number</td>
                                <td className="font-semibold text-right">{safeData.invoiceNumber}</td>
                            </tr>
                            <tr>
                                <td className="pr-5 text-gray-600 text-right">Invoice Date</td>
                                <td className="font-semibold text-right">{format(safeData.invoiceDate, 'dd MMMM yyyy')}</td>
                            </tr>
                            <tr>
                                <td className="pr-5 text-gray-600 text-right">Due Date</td>
                                <td className="font-semibold text-right">{format(safeData.dueDate, 'dd MMMM yyyy')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-10 mb-8">
                <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600 border-b border-gray-300 pb-1 mb-2">Bill To</div>
                    <div className="font-semibold">{safeData.toName}</div>
                    <div className="whitespace-pre-line">
                        {safeData.toAddress}
                        {safeData.toEmail && <>{'\n'}{safeData.toEmail}</>}
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse mb-8">
                <thead>
                    <tr>
                        <th className="text-[11px] font-semibold uppercase tracking-wider text-black p-2 text-left border-y border-black">Service / Description</th>
                        <th className="text-[11px] font-semibold uppercase tracking-wider text-black p-2 text-right border-y border-black w-24">Quantity</th>
                        <th className="text-[11px] font-semibold uppercase tracking-wider text-black p-2 text-right border-y border-black w-32">Unit Price</th>
                        <th className="text-[11px] font-semibold uppercase tracking-wider text-black p-2 text-right border-y border-black w-32">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {safeData.items.map((item, index) => {
                        const itemTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                        const isNumeric = !isNaN(Number(item.quantity)) && !isNaN(Number(item.price));
                        return (
                            <tr key={index} className="last:border-b-0">
                                <td className="p-3 border-b border-gray-200">
                                    <div className="font-semibold">{item.description || '...'}</div>
                                </td>
                                <td className="p-3 border-b border-gray-200 text-right">{item.quantity}</td>
                                <td className="p-3 border-b border-gray-200 text-right">{formatPrice(item.price)}</td>
                                <td className="p-3 border-b border-gray-200 text-right">{isNumeric ? formatCurrency(itemTotal) : '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-end mb-10">
                <div className="w-[280px]">
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="p-2">Subtotal</td>
                                <td className="p-2 text-right font-semibold">{formatCurrency(subtotal)}</td>
                            </tr>
                            {safeData.discountRate > 0 &&
                                <tr>
                                    <td className="p-2">Discount ({safeData.discountRate}%)</td>
                                    <td className="p-2 text-right font-semibold text-red-500">-{formatCurrency(discountAmount)}</td>
                                </tr>
                            }
                             <tr>
                                <td className="p-2">Tax ({safeData.taxRate}%)</td>
                                <td className="p-2 text-right font-semibold">{formatCurrency(taxAmount)}</td>
                            </tr>
                            <tr className="text-sm font-bold">
                                <td className="p-3 border-y-2 border-black">Grand Total</td>
                                <td className="p-3 border-y-2 border-black text-right">{formatCurrency(total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-auto pt-8 text-gray-800 text-[11px] grid grid-cols-2 gap-10">
                <div>
                     {safeData.notes && (
                        <>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600 border-b border-gray-300 pb-1 mb-2">Notes</div>
                            <p className="whitespace-pre-line">{safeData.notes}</p>
                        </>
                    )}
                </div>
                 <div>
                    {safeData.paymentDetails && (safeData.paymentDetails.bankName || safeData.paymentDetails.accountName) && (
                        <>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600 border-b border-gray-300 pb-1 mb-2">Payment Details</div>
                        <div className="space-y-1">
                            {safeData.paymentDetails.bankName && <p><strong>Bank:</strong> <span className="font-bold">{safeData.paymentDetails.bankName}</span></p>}
                            {safeData.paymentDetails.accountName && <p><strong>Account Name:</strong> <span className="font-bold">{safeData.paymentDetails.accountName}</span></p>}
                            {safeData.paymentDetails.accountNumber && <p><strong>Account No:</strong> <span className="font-bold">{safeData.paymentDetails.accountNumber}</span></p>}
                            {safeData.paymentDetails.paymentMethod && <p><strong>Method:</strong> <span className="font-bold">{safeData.paymentDetails.paymentMethod}</span></p>}
                        </div>
                        </>
                    )}
                 </div>
            </div>
        </div>
    );
};

SriVelsTemplate.displayName = "SriVelsTemplate";
