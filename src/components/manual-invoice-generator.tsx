'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { type InvoiceFormValues } from '@/types/invoice';

interface ManualInvoiceGeneratorProps {
  form: UseFormReturn<InvoiceFormValues>;
}

export function ManualInvoiceGenerator({ form }: ManualInvoiceGeneratorProps) {
  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });

  const invoiceDate = form.watch('invoiceDate');

  return (
    <Form {...form}>
      <form className="space-y-10">
        
        {/* Section: Document */}
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-normal text-muted-foreground">Invoice Number</FormLabel>
                        <FormControl><Input {...field} value={field.value ?? ''}/></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="invoiceDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-normal text-muted-foreground">Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={'secondary'} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-normal text-muted-foreground">Due Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={'secondary'} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < invoiceDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
        </div>

        {/* Section: From */}
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">From</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fromName" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Your Company" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="fromRegNo" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Registration No." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
             </div>
             <FormField control={form.control} name="fromEmail" render={({ field }) => (
                <FormItem><FormControl><Input placeholder="your.email@company.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
             )} />
             <FormField control={form.control} name="fromAddress" render={({ field }) => (
                <FormItem><FormControl><Textarea placeholder="Your address..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
             )} />
        </div>

        {/* Section: Bill To */}
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Bill To</h3>
            <FormField control={form.control} name="toName" render={({ field }) => (
                <FormItem><FormControl><Input placeholder="Client Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="toEmail" render={({ field }) => (
                <FormItem><FormControl><Input placeholder="client.email@company.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="toAddress" render={({ field }) => (
                <FormItem><FormControl><Textarea placeholder="Client address..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        {/* Section: Items */}
        <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-4">Line Items</h3>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-start">
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                        <FormItem><FormControl><Input placeholder="Item description" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                        <FormItem><FormControl><Input type="text" placeholder="Qty" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                        <FormItem><FormControl><Input type="text" placeholder="Price" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive mt-1" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 size={16}/>
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full mt-4"
              onClick={() => append({ description: '', quantity: 1, price: 0 })}
            >
              <Plus size={16}/> Add Item
            </Button>
        </div>
        
        {/* Section: Totals & Notes */}
        <div className="space-y-4">
             <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Totals & Notes</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="discountRate" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">Discount (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">Tax (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">Notes</FormLabel><FormControl><Textarea placeholder="Add any additional notes for the client..." className="resize-none" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        {/* Section: Payment Instructions */}
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Payment Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="paymentDetails.bankName" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Bank Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paymentDetails.accountName" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Account Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="paymentDetails.accountNumber" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Account Number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="paymentDetails.paymentMethod" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Payment Method" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
        </div>
      </form>
    </Form>
  );
}
