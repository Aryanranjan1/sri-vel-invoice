'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { type InvoiceFormValues } from '@/types/invoice';

type EditorialTemplateProps = {
  data: InvoiceFormValues;
};

export const EditorialTemplate = React.forwardRef<HTMLDivElement, EditorialTemplateProps>(
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
        invoiceNumber: data.invoiceNumber || 'INV-001',
        fromName: data.fromName || 'Sri Vels Catering & Transportation',
        fromAddress: data.fromAddress || 'Reg No (SSM): 202503053810 (JR0174329-K)\n6580 Sempadan KG Dato Mansu, Gpasir Rasah Seremban\n70300 Seremban, Negeri Sembilan',
        toName: data.toName || '[Customer Name]',
        toAddress: data.toAddress || '[Company Name]\n[Customer Address]\n[Contact Details]',
        invoiceDate: data.invoiceDate || new Date(),
        dueDate: data.dueDate || new Date(),
        items: data.items.length > 0 && data.items.some(i => i.description) ? data.items : [{ description: 'Catering Lunch (100 Pax)', quantity: 100, price: 7.20 }],
        notes: data.notes || `Payment is strictly due within 7 days of the invoice date. Please reference invoice number ${data.invoiceNumber || 'INV-001'} when making your transfer.`,
        taxRate: Number(data.taxRate) || 0,
        discountRate: Number(data.discountRate) || 0,
    };
    
    return (
        <div ref={ref} className="bg-white text-black font-body text-[12px] leading-normal w-full min-h-full p-8 md:p-[20mm] flex flex-col print:p-0">
             <header className="flex justify-between items-end mb-[25px]">
                <div className="max-w-[60%]">
                    <div className="text-base font-extrabold uppercase tracking-[-0.5px] mb-1.5">{safeData.fromName}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wide leading-relaxed whitespace-pre-line">
                        {safeData.fromAddress}
                    </div>
                </div>
                <div className="text-[42px] font-extrabold tracking-[-2px] leading-none">INVOICE</div>
            </header>

            <div className="grid grid-cols-3 border-y-2 border-black py-[15px] mb-[30px]">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Invoice Number</span>
                    <span className="text-[13px] font-semibold">{safeData.invoiceNumber}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Date of Issue</span>
                    <span className="text-[13px] font-semibold">{format(safeData.invoiceDate, 'dd MMMM yyyy')}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Payment Due</span>
                    <span className="text-[13px] font-semibold">{format(safeData.dueDate, 'dd MMMM yyyy')}</span>
                </div>
            </div>

            <section className="mb-10">
                <div className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Billed To</div>
                <div className="text-lg font-extrabold mb-1">{safeData.toName}</div>
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {safeData.toAddress}
                </div>
            </section>

            <table className="w-full border-collapse mb-[30px]">
                <thead>
                    <tr>
                        <th className="text-[10px] font-extrabold uppercase tracking-widest text-black py-3 text-left border-b-2 border-black">Description</th>
                        <th className="text-[10px] font-extrabold uppercase tracking-widest text-black py-3 text-right border-b-2 border-black">Qty</th>
                        <th className="text-[10px] font-extrabold uppercase tracking-widest text-black py-3 text-right border-b-2 border-black">Unit Price</th>
                        <th className="text-[10px] font-extrabold uppercase tracking-widest text-black py-3 text-right border-b-2 border-black">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {safeData.items.map((item, index) => {
                        const itemTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                        return (
                            <tr key={index}>
                                <td className="py-[15px] border-b border-gray-200 text-left">
                                    <div className="text-[13px] font-semibold">{item.description || '...'}</div>
                                </td>
                                <td className="py-[15px] border-b border-gray-200 text-right">{Number(item.quantity) || 0}</td>
                                <td className="py-[15px] border-b border-gray-200 text-right">{formatCurrency(Number(item.price) || 0)}</td>
                                <td className="py-[15px] border-b border-gray-200 text-right">{formatCurrency(itemTotal)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-end mb-[50px]">
                <div className="w-[280px]">
                     <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="p-2.5 border-b border-gray-200">Subtotal</td>
                                <td className="p-2.5 border-b border-gray-200 text-right font-semibold">{formatCurrency(subtotal)}</td>
                            </tr>
                             {safeData.discountRate > 0 &&
                                <tr>
                                    <td className="p-2.5 border-b border-gray-200">Discount ({safeData.discountRate}%)</td>
                                    <td className="p-2.5 border-b border-gray-200 text-right font-semibold text-red-500">-{formatCurrency(discountAmount)}</td>
                                </tr>
                            }
                            <tr>
                                <td className="p-2.5 border-b border-gray-200">Tax ({safeData.taxRate}%)</td>
                                <td className="p-2.5 border-b border-gray-200 text-right font-semibold">{formatCurrency(taxAmount)}</td>
                            </tr>
                            <tr className="print:color-adjust-exact">
                                <td className="p-4 bg-black text-white font-extrabold text-base">GRAND TOTAL</td>
                                <td className="p-4 bg-black text-white font-extrabold text-base text-right">{formatCurrency(total)}</td>
                            </tr>
                        </tbody>
                     </table>
                </div>
            </div>

            <footer className="grid grid-cols-2 gap-12 mt-auto pt-[30px] border-t-2 border-black">
                <div className="text-[11px]">
                    <div className="text-[9px] uppercase tracking-widest font-extrabold mb-2.5">Payment Instructions</div>
                    <div className="flex mb-1.5">
                        <span className="w-[120px] text-gray-600">Bank Name</span>
                        <span className="font-semibold">MAYBANK</span>
                    </div>
                    <div className="flex mb-1.5">
                        <span className="w-[120px] text-gray-600">Account Name</span>
                        <span className="font-semibold">SRI VELS CATERING</span>
                    </div>
                    <div className="flex mb-1.5">
                        <span className="w-[120px] text-gray-600">Account No.</span>
                        <span className="font-semibold">555015029067</span>
                    </div>
                     <div className="flex">
                        <span className="w-[120px] text-gray-600">Method</span>
                        <span className="font-semibold">Bank Transfer</span>
                    </div>
                </div>
                 <div className="text-[11px]">
                    <div className="text-[9px] uppercase tracking-widest font-extrabold mb-2.5">Terms & Notes</div>
                    <div className="text-gray-700 leading-relaxed">
                        <strong className="text-black">Thank you for your business.</strong><br/>
                        {safeData.notes}
                    </div>
                </div>
            </footer>
        </div>
    );
  }
);

EditorialTemplate.displayName = "EditorialTemplate";
