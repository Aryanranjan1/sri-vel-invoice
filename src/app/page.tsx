'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { AiInvoiceWizard } from '@/components/ai-invoice-wizard';
import { InvoicePreview } from '@/components/invoice-preview';
import { type InvoiceFormValues, invoiceFormSchema } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Bot, Download, CheckCircle2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useFieldArray } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function InvoicePage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const { toast } = useToast();
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const defaultValues: Partial<InvoiceFormValues> = {
    documentType: 'invoice',
    template: 'editorial',
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    fromName: 'SRI VELS CATERING & TRANSPORTATION',
    fromRegNo: '202503053810 (JR0174329-K)',
    fromEmail: '',
    fromAddress: '6580 SEMPADAN KG DATO MANSU GPASIR RASAH SEREMBAN\n70300 SEREMBAN, NEGERI SEMBILAN',
    toName: '',
    toEmail: '',
    toAddress: '',
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: 'Thank you for your business.\n\nPayment due within 7 days.',
    taxRate: 0,
    discountRate: 0,
    amountPaid: 0,
    depositStatus: 'none',
    depositAmount: 0,
    paymentDetails: {
      bankName: 'MAYBANK',
      accountName: 'SRI VELS CATERING',
      accountNumber: '555015029067',
      paymentMethod: 'Bank Transfer',
    },
  };

  const manualForm = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: manualForm.control,
  });

  const watchedDocType = manualForm.watch('documentType');
  const invoiceDate = manualForm.watch('invoiceDate');

  useEffect(() => {
    const subscription = manualForm.watch((value, { name, type }) => {
      const newValues = value as InvoiceFormValues;
      if (name === 'documentType' && type === 'change') {
        const currentNumber = newValues.invoiceNumber || `INV-${String(Date.now()).slice(-6)}`;
        let newNumber = currentNumber;

        if (newValues.documentType === 'receipt') {
          newNumber = currentNumber.replace('INV-', 'REC-').replace('DEP-', 'REC-');
        } else if (newValues.documentType === 'deposit') {
            newNumber = currentNumber.replace('INV-', 'DEP-').replace('REC-', 'DEP-');
        } else { // invoice
            newNumber = currentNumber.replace('REC-', 'INV-').replace('DEP-', 'INV-');
        }
        manualForm.setValue('invoiceNumber', newNumber);
      }
    });
    return () => subscription.unsubscribe();
  }, [manualForm]);

  const watchedManualData = manualForm.watch();

  const [aiInvoices, setAiInvoices] = useState<InvoiceFormValues[]>([]);
  const [activeAiInvoiceIndex, setActiveAiInvoiceIndex] = useState<number | null>(null);

  let previewData: InvoiceFormValues | null = null;
  if (mode === 'manual') {
    previewData = watchedManualData;
  } else if (activeAiInvoiceIndex !== null && aiInvoices[activeAiInvoiceIndex]) {
    previewData = aiInvoices[activeAiInvoiceIndex];
  }

  const handleDownloadPdf = async () => {
    const paperElement = invoicePreviewRef.current?.querySelector<HTMLDivElement>('[data-invoice-paper]');

    if (!paperElement || !previewData) {
      toast({
        variant: 'destructive',
        title: 'Preview Not Found',
        description: 'Cannot download document because the preview is not available.',
      });
      return;
    }

    toast({
      title: 'Generating PDF...',
      description: `Your ${previewData.documentType} is being prepared for download.`,
    });

    try {
      const canvas = await html2canvas(paperElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / canvasHeight;
      const imgHeight = pdfWidth / ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

      pdf.save(`${previewData.documentType}-${previewData.invoiceNumber || 'download'}.pdf`);

      toast({
        title: 'Download Started!',
        description: `Your ${previewData.documentType} PDF has been successfully generated.`,
      });
    } catch (error) {
      console.error(`Failed to download ${previewData.documentType}:`, error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'An unexpected error occurred while generating the PDF.',
      });
    }
  };

  const handleDownloadImage = async () => {
    const paperElement = invoicePreviewRef.current?.querySelector<HTMLDivElement>('[data-invoice-paper]');

    if (!paperElement || !previewData) {
      toast({
        variant: 'destructive',
        title: 'Preview Not Found',
        description: 'Cannot download image because the preview is not available.',
      });
      return;
    }

    toast({
      title: 'Generating Image...',
      description: `Your ${previewData.documentType} is being prepared for download.`,
    });

    try {
      const canvas = await html2canvas(paperElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${previewData.documentType}-${previewData.invoiceNumber || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Started!',
        description: `Your ${previewData.documentType} image has been successfully generated.`,
      });
    } catch (error) {
      console.error(`Failed to download ${previewData.documentType} as image:`, error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'An unexpected error occurred while generating the image.',
      });
    }
  };

  const switchMode = (selectedMode: 'manual' | 'ai') => {
    setMode(selectedMode);
    setActiveAiInvoiceIndex(null); 
  };

  const getDocumentTypeLabel = (docType: string) => {
    switch(docType) {
      case 'invoice': return 'Invoice';
      case 'receipt': return 'Receipt';
      case 'deposit': return 'Deposit';
      default: return 'Document';
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-semibold tracking-tight">Sri Vels <span className="text-muted-foreground font-normal">/ Invoice & Receipt</span></h1>
        </div>
        
        <div className="bg-secondary p-1 rounded-lg inline-flex items-center justify-center mx-auto sm:mx-0">
            <button 
              onClick={() => switchMode('manual')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                mode === 'manual' ? 'bg-background text-primary shadow-sm' : 'bg-transparent text-secondary-foreground'
              )}
            >
              Manual
            </button>
            <button 
              onClick={() => switchMode('ai')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                mode === 'ai' ? 'bg-background text-primary shadow-sm' : 'bg-transparent text-secondary-foreground'
              )}
            >
              <Bot size={16} /> AI Parse
            </button>
        </div>
        
        <div className="text-center sm:text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={!previewData}>
                <Download size={16} /> Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPdf}>
                <Download size={16} className="mr-2" />
                <span>PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadImage}>
                <ImageIcon size={16} className="mr-2" />
                <span>Image (PNG)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-16 items-start">
        {/* LEFT PANEL */}
        <div className="space-y-10">
          {mode === 'manual' && (
            <Form {...manualForm}>
            <form className="space-y-10">
              {/* Section: Document */}
              <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Document</h3>
                  <FormField
                    control={manualForm.control}
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
                            <SelectItem value="deposit">Deposit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={manualForm.control} name="invoiceNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{getDocumentTypeLabel(watchedDocType)} Number</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ''}/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField
                      control={manualForm.control}
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
                      <FormField control={manualForm.control} name="invoiceDate" render={({ field }) => (
                          <FormItem>
                              <FormLabel>{getDocumentTypeLabel(watchedDocType)} Date</FormLabel>
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
                        <FormField control={manualForm.control} name="dueDate" render={({ field }) => (
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
                        <FormField control={manualForm.control} name="amountPaid" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount Paid</FormLabel>
                            <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? 0} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} /></FormControl>
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
                      <FormField control={manualForm.control} name="fromName" render={({ field }) => (
                          <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Company" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={manualForm.control} name="fromRegNo" render={({ field }) => (
                          <FormItem><FormLabel>Reg. No.</FormLabel><FormControl><Input placeholder="Registration No." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                   </div>
                   <FormField control={manualForm.control} name="fromAddress" render={({ field }) => (
                      <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Your address..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                   )} />
                   <FormField control={manualForm.control} name="fromEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input placeholder="your.email@company.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                   )} />
              </div>
      
              {/* Section: Bill To */}
              <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Bill To</h3>
                  <FormField control={manualForm.control} name="toName" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Client Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={manualForm.control} name="toAddress" render={({ field }) => (
                      <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Client address..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={manualForm.control} name="toEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input placeholder="client.email@company.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                   )} />
              </div>
      
              {/* Section: Items */}
              <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-4">Line Items</h3>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-start">
                          <FormField control={manualForm.control} name={`items.${index}.description`} render={({ field }) => (
                              <FormItem><FormControl><Input placeholder="Item description" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={manualForm.control} name={`items.${index}.quantity`} render={({ field }) => (
                              <FormItem><FormControl><Input type="text" placeholder="Qty" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={manualForm.control} name={`items.${index}.price`} render={({ field }) => (
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
                      <FormField control={manualForm.control} name="discountRate" render={({ field }) => (
                          <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={manualForm.control} name="taxRate" render={({ field }) => (
                          <FormItem><FormLabel>Tax (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem>
                      )} />
                  </div>
                  {watchedDocType === 'invoice' && (
                    <div className="space-y-4 pt-4">
                      <FormField
                        control={manualForm.control}
                        name="depositStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deposit Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select deposit status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No Deposit</SelectItem>
                                <SelectItem value="paid">Deposit Paid</SelectItem>
                                <SelectItem value="due">Deposit Due</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {manualForm.watch('depositStatus') !== 'none' && (
                        <FormField
                          control={manualForm.control}
                          name="depositAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                  <FormField control={manualForm.control} name="notes" render={({ field }) => (
                      <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any additional notes for the client..." className="resize-none" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
              </div>
              {/* Section: Payment Instructions */}
              <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Payment Instructions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={manualForm.control} name="paymentDetails.bankName" render={({ field }) => (
                          <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="Bank Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={manualForm.control} name="paymentDetails.accountName" render={({ field }) => (
                          <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input placeholder="Account Name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={manualForm.control} name="paymentDetails.accountNumber" render={({ field }) => (
                          <FormItem><FormLabel>Account No.</FormLabel><FormControl><Input placeholder="Account Number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={manualForm.control} name="paymentDetails.paymentMethod" render={({ field }) => (
                          <FormItem><FormLabel>Method</FormLabel><FormControl><Input placeholder="Payment Method" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                  </div>
              </div>
            </form>
          </Form>
          )}
          {mode === 'ai' && (
            <AiInvoiceWizard
              invoices={aiInvoices}
              setInvoices={setAiInvoices}
              activeInvoiceIndex={activeAiInvoiceIndex}
              setActiveInvoiceIndex={setActiveAiInvoiceIndex}
              defaultValues={defaultValues}
            />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="sticky top-8 mt-12 lg:mt-0">
          <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
              <span>Live Preview</span>
              <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={14} className="text-green-500"/> Auto-saved
              </div>
          </div>
          <div className="bg-card rounded-lg shadow-lg">
            <div
              ref={invoicePreviewRef}
              className="overflow-hidden rounded-lg"
            >
              <div data-invoice-paper className="w-full flex flex-col bg-white origin-top-left">
                {previewData ? (
                  <InvoicePreview data={previewData} />
                ) : (
                  <div className="flex items-center justify-center text-center text-muted-foreground bg-secondary/30 rounded-md h-full w-full">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">No document to preview</h3>
                        <p className="text-sm">
                          {mode === 'ai' 
                            ? 'Extract invoices with AI to see a preview.' 
                            : 'Fill out the form to see a preview.'
                          }
                        </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
