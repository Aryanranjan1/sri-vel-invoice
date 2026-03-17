'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { type InvoiceFormValues } from '@/types/invoice';

type SriVelsTemplateProps = {
  data: InvoiceFormValues;
};

export const SriVelsTemplate = React.forwardRef<HTMLDivElement, SriVelsTemplateProps>(
  ({ data }, ref) => {
    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
    const discountAmount = subtotal * ((Number(data.discountRate) || 0) / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.taxRate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;

    const formatCurrency = (amount: number) => {
        return 'RM ' + amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const safeData = {
        invoiceNumber: data.invoiceNumber || 'INV-000',
        fromName: data.fromName || 'Sri Vels Catering & Transportation',
        fromAddress: data.fromAddress || '6580 SEMPADAN KG DATO MANSU\nGPASIR RASAH SEREMBAN\n70300 SEREMBAN, NEGERI SEMBILAN',
        toName: data.toName || '[Customer Name]',
        toAddress: data.toAddress || '[Customer Address]',
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        items: data.items.length > 1 || (data.items.length === 1 && data.items[0].description) ? data.items : [{ description: 'Catering Lunch (100 Pax)', quantity: 100, price: 7.20 }],
        notes: data.notes || 'Payment due within 7 days. Please use the invoice number as the payment reference.',
        taxRate: Number(data.taxRate) || 0,
        discountRate: Number(data.discountRate) || 0,
    };
    
    return (
        <div ref={ref} className="bg-white text-black font-body text-[12px] leading-normal w-full min-h-full p-8 md:p-[20mm] flex flex-col print:p-0">
            <header className="flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
                <div className="flex-1">
                    <div className="text-lg font-bold uppercase tracking-wide">{safeData.fromName}</div>
                    {safeData.fromName === 'Sri Vels Catering & Transportation' && 
                        <span className="text-[11px] text-gray-700 font-semibold block mb-3">Registration No (SSM): 202503053810 (JR0174329-K)</span>
                    }
                    <div className="text-xs text-gray-800 whitespace-pre-line">
                        {safeData.fromAddress}
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
                    <div className="whitespace-pre-line">{safeData.toAddress}</div>
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
                        return (
                            <tr key={index} className="last:border-b-0">
                                <td className="p-3 border-b border-gray-200">
                                    <div className="font-semibold">{item.description || '...'}</div>
                                </td>
                                <td className="p-3 border-b border-gray-200 text-right">{Number(item.quantity) || 0}</td>
                                <td className="p-3 border-b border-gray-200 text-right">{formatCurrency(Number(item.price) || 0)}</td>
                                <td className="p-3 border-b border-gray-200 text-right">{formatCurrency(itemTotal)}</td>
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

            <div className="grid grid-cols-2 gap-10 mt-auto pt-8">
                <div className="text-[11px]">
                     <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600 border-b border-gray-300 pb-1 mb-2">Payment Details</div>
                    <p><span className="text-gray-600 inline-block w-28">Bank Name:</span> <strong className="font-semibold">MAYBANK</strong></p>
                    <p><span className="text-gray-600 inline-block w-28">Account Name:</span> <strong className="font-semibold">SRI VELS CATERING</strong></p>
                    <p><span className="text-gray-600 inline-block w-28">Account Number:</span> <strong className="font-semibold">555015029067</strong></p>
                    <p><span className="text-gray-600 inline-block w-28">Payment Method:</span> Bank Transfer</p>
                </div>
                <div className="text-[11px] text-gray-800">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600 border-b border-gray-300 pb-1 mb-2">Notes</div>
                    <strong className="block mb-1 text-xs text-black font-semibold">Thank you for your business.</strong>
                    <p>{safeData.notes}</p>
                </div>
            </div>
        </div>
    );
  }
);

SriVelsTemplate.displayName = "SriVelsTemplate";
