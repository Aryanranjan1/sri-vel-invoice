'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { type InvoiceFormValues, invoiceFormSchema } from '@/types/invoice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from './ui/calendar';

interface EditableInvoiceFormProps {
    initialData: InvoiceFormValues;
    onUpdate: (data: InvoiceFormValues) => void;
}

export function EditableInvoiceForm({ initialData, onUpdate }: EditableInvoiceFormProps) {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      const newValues = value as InvoiceFormValues;
      if (name === 'documentType' && type === 'change') {
        if (newValues.documentType === 'receipt') {
          if (newValues.invoiceNumber.startsWith('INV-')) {
            form.setValue('invoiceNumber', newValues.invoiceNumber.replace('INV-', 'REC-'));
          }
        } else {
          if (newValues.invoiceNumber.startsWith('REC-')) {
            form.setValue('invoiceNumber', newValues.invoiceNumber.replace('REC-', 'INV-'));
          }
        }
      }
      onUpdate(newValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  const watchedDocType = form.watch('documentType');
  const invoiceDate = form.watch('invoiceDate');
  
  return (
    <div className="space-y-8">
        <Form {...form}>
            <form className="space-y-8">
            {/* Section: Document */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Document</h3>
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{watchedDocType === 'invoice' ? 'Invoice' : 'Receipt'} Number</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ''}/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default">Minimalist</SelectItem>
                              <SelectItem value="sri-vels">Sri Vels</SelectItem>
                              <SelectItem value="editorial">Editorial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="invoiceDate" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{watchedDocType === 'invoice' ? 'Invoice' : 'Receipt'} Date</FormLabel>
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
                    {watchedDocType === 'invoice' ? (
                      <FormField control={form.control} name="dueDate" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Due Date</FormLabel>
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
                    ) : (
                      <FormField control={form.control} name="amountPaid" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount Paid</FormLabel>
                            <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    )}
                </div>
            </div>

            {/* Section: From */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">From</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fromName" render={({ field }) => (
                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Company" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="fromRegNo" render={({ field }) => (
                        <FormItem><FormLabel>Reg. No.</FormLabel><FormControl><Input placeholder="Registration No." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
                 <FormField control={form.control} name="fromAddress" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Your address..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                 )} />
                 <FormField control={form.control} name="fromEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input placeholder="your.email@company.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                 )} />
            </div>

            {/* Section: Bill To */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Bill To</h3>
                <FormField control={form.control} name="toName" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Client Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="toAddress" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Client address..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="toEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input placeholder="client.email@company.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
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
                <Button type="button" variant="secondary" className="w-full mt-4" onClick={() => append({ description: '', quantity: 1, price: 0 })}>
                    <Plus size={16}/> Add Item
                </Button>
            </div>
            
            {/* Section: Totals & Notes */}
            <div className="space-y-4">
                 <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Totals & Notes</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="discountRate" render={({ field }) => (
                        <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="taxRate" render={({ field }) => (
                        <FormItem><FormLabel>Tax (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any additional notes for the client..." className="resize-none" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

            {/* Section: Payment Instructions */}
            <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Payment Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="paymentDetails.bankName" render={({ field }) => (
                        <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="Bank Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="paymentDetails.accountName" render={({ field }) => (
                        <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input placeholder="Account Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="paymentDetails.accountNumber" render={({ field }) => (
                        <FormItem><FormLabel>Account No.</FormLabel><FormControl><Input placeholder="Account Number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="paymentDetails.paymentMethod" render={({ field }) => (
                        <FormItem><FormLabel>Method</FormLabel><FormControl><Input placeholder="Payment Method" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>
            </form>
        </Form>
    </div>
  );
}
