
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Download, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { InvoicePreview, type InvoiceFormData } from '@/components/invoice-preview';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  price: z.coerce.number().min(0.01, 'Price must be a positive number.'),
});

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  fromName: z.string().min(1, '"From" name is required'),
  fromEmail: z.string().email(),
  fromAddress: z.string().min(1, '"From" address is required'),
  toName: z.string().min(1, '"To" name is required'),
  toEmail: z.string().email(),
  toAddress: z.string().min(1, '"To" address is required'),
  invoiceDate: z.date({ required_error: "Invoice date is required." }),
  dueDate: z.date({ required_error: "Due date is required." }),
  items: z.array(lineItemSchema).min(1, 'Please add at least one item.'),
  notes: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discountRate: z.coerce.number().min(0).max(100).optional().default(0),
  template: z.string().optional().default('modern'),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function NewInvoicePage() {
    const { toast } = useToast();
    const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const defaultValues: Partial<InvoiceFormValues> = {
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: 'Thank you for your business.',
    taxRate: 8, // Example tax
    discountRate: 0,
    template: 'modern',
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });

  const handleDownload = async (format: 'pdf' | 'png') => {
    if (!invoicePreviewRef.current) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not find the invoice preview to download.',
        });
        return;
    }
    
    toast({ title: 'Preparing download...', description: `Your invoice is being generated as a ${format.toUpperCase()} file.` });

    try {
        const canvas = await html2canvas(invoicePreviewRef.current, {
            scale: 2.5, // Higher scale for better quality
            useCORS: true,
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `invoice-${form.getValues('invoiceNumber') || 'download'}.png`;
            link.href = imgData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else { // pdf
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`invoice-${form.getValues('invoiceNumber') || 'download'}.pdf`);
        }
         toast({ title: 'Download Started!', description: `Your invoice has been downloaded.` });
    } catch (error) {
        console.error("Failed to download invoice:", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'An unexpected error occurred while generating the file.',
        });
    }
  };
  
  const watchedData = form.watch() as InvoiceFormData;
  const invoiceDate = form.watch('invoiceDate');
  const watchedTemplate = form.watch('template');

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Create Invoice</h1>
            <div className="mt-4 sm:mt-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Download className="mr-2" /> Download Invoice
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                            Download as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload('png')}>
                            Download as PNG
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
          <Form {...form}>
            <form className="space-y-8">
               <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Template</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a visual template for your invoice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the look and feel of your invoice. The preview will update instantly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">From</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@company.com" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="fromAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St..." {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Bill To</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="toName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Client Company" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="client.email@company.com" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="toAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="456 Client Ave..." {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal justify-start',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal justify-start',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < invoiceDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Items</h2>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 rounded-md border bg-muted/20">
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input placeholder="Item description" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1" {...field} value={field.value ?? 0} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="100.00" {...field} value={field.value ?? 0} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => append({ description: '', quantity: 1, price: 0 })}
                >
                  <Plus className="mr-2" /> Add Item
                </Button>
              </div>
              
               <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Totals & Notes</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any additional notes for the client..."
                              className="resize-none"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                       <FormField
                         control={form.control}
                         name="discountRate"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Discount (%)</FormLabel>
                             <FormControl>
                               <Input type="number" placeholder="0" {...field} value={field.value ?? 0} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="taxRate"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Tax (%)</FormLabel>
                             <FormControl>
                               <Input type="number" placeholder="0" {...field} value={field.value ?? 0} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                    </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <h2 className="text-xl font-semibold mb-4 text-center lg:text-left">Live Preview</h2>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <InvoicePreview ref={invoicePreviewRef} data={watchedData} template={watchedTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}

    
