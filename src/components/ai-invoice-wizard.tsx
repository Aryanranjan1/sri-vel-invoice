'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, MoreHorizontal } from 'lucide-react';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';
import { type InvoiceFormValues } from '@/types/invoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { EditableInvoiceForm } from './editable-invoice-form';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AiInvoiceWizardProps {
    invoices: InvoiceFormValues[];
    setInvoices: React.Dispatch<React.SetStateAction<InvoiceFormValues[]>>;
    activeInvoiceIndex: number | null;
    setActiveInvoiceIndex: (index: number | null) => void;
    defaultValues: Partial<InvoiceFormValues>;
}

export function AiInvoiceWizard({ invoices, setInvoices, activeInvoiceIndex, setActiveInvoiceIndex, defaultValues }: AiInvoiceWizardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [unstructuredText, setUnstructuredText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleExtract = async () => {
    if (!unstructuredText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please paste some text to extract invoice data from.',
      });
      return;
    }
    setIsLoading(true);
    setInvoices([]);
    setActiveInvoiceIndex(null);
    setEditingIndex(null);
    try {
      const result = await extractInvoiceData({ unstructuredData: unstructuredText });
      
      if (!result.invoices || result.invoices.length === 0) {
        throw new Error('The AI could not detect any invoice data.');
      }
      
      const mappedInvoices: InvoiceFormValues[] = result.invoices.map((extracted, index) => {
        const invoiceDate = extracted.date ? new Date(extracted.date) : new Date();
        const timeZoneOffset = invoiceDate.getTimezoneOffset() * 60000;
        const adjustedInvoiceDate = new Date(invoiceDate.getTime() + timeZoneOffset);
        const dueDate = new Date(adjustedInvoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);

        return {
          ...(defaultValues as InvoiceFormValues),
          documentType: 'invoice',
          template: 'editorial',
          invoiceNumber: `INV-${String(Date.now()).slice(-6)}-${index}`,
          toName: extracted.clientName || '',
          notes: [extracted.title, extracted.notes].filter(Boolean).join('\n\n') || defaultValues.notes || '',
          items: extracted.items.length > 0 ? extracted.items.map(item => ({
            description: item.name || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
          })) : defaultValues.items || [],
          invoiceDate: adjustedInvoiceDate,
          dueDate: dueDate,
        };
      });

      setInvoices(mappedInvoices);
      setActiveInvoiceIndex(0);

      toast({
        title: `Extracted ${mappedInvoices.length} invoice(s)!`,
        description: 'Review and edit the invoices below.',
      });

    } catch (error: any) {
      console.error('Failed to extract invoice data:', error);
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInvoice = (index: number, updatedData: InvoiceFormValues) => {
    const newInvoices = [...invoices];
    newInvoices[index] = updatedData;
    setInvoices(newInvoices);
  };
  
  const handleRemoveInvoice = (index: number) => {
    const newInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(newInvoices);
    if (activeInvoiceIndex === index) {
      setActiveInvoiceIndex(newInvoices.length > 0 ? 0 : null);
    } else if (activeInvoiceIndex && activeInvoiceIndex > index) {
      setActiveInvoiceIndex(activeInvoiceIndex - 1);
    }
  };

  const handleViewAs = (index: number, type: 'invoice' | 'receipt' | 'deposit') => {
    const newInvoices = [...invoices];
    const invoice = { ...newInvoices[index] };

    invoice.documentType = type;

    let currentNumber = invoice.invoiceNumber;
    if (type === 'receipt') {
      currentNumber = currentNumber.replace('INV-', 'REC-').replace('DEP-', 'REC-');
    } else if (type === 'deposit') {
      currentNumber = currentNumber.replace('INV-', 'DEP-').replace('REC-', 'DEP-');
    } else { // type === 'invoice'
      currentNumber = currentNumber.replace('REC-', 'INV-').replace('DEP-', 'INV-');
    }
    invoice.invoiceNumber = currentNumber;
    
    newInvoices[index] = invoice;
    setInvoices(newInvoices);
    setActiveInvoiceIndex(index);
    toast({
      title: `Switched to ${type}`,
      description: `${invoice.toName || 'Document'} is now a ${type}.`,
    });
  };

  if (editingIndex !== null) {
    return (
      <div>
        <Button variant="outline" onClick={() => setEditingIndex(null)} className="mb-4">
            &larr; Back to Document List
        </Button>
        <EditableInvoiceForm
            initialData={invoices[editingIndex]} 
            onUpdate={(data) => handleUpdateInvoice(editingIndex, data)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles size={20} className="text-accent"/>AI Natural Language Parser</h3>
            <p className="text-sm text-muted-foreground">
                Paste your informal chat logs, emails, or fragmented notes. The parser will automatically structure the data into one or more documents.
            </p>
        </div>

        <Textarea
        placeholder="e.g., Matthene wants 100 pax lunch on the 17th. RM7.20 each. Include Podelanga. Apply 8% tax."
        value={unstructuredText}
        onChange={(e) => setUnstructuredText(e.target.value)}
        className="min-h-[150px]"
        disabled={isLoading}
        />
        <Button onClick={handleExtract} disabled={isLoading || !unstructuredText} className="w-full sm:w-auto">
        {isLoading ? (
            <>
            <Loader2 className="mr-2 animate-spin" />
            Processing Data...
            </>
        ) : (
            <>
            <Sparkles className="mr-2" />
            Process & Extract Documents
            </>
        )}
        </Button>

      {invoices.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Extracted Documents</CardTitle>
                <CardDescription>Review and manage the extracted documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Current #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice, index) => (
                        <TableRow
                            key={index}
                            onClick={() => setActiveInvoiceIndex(index)}
                            className={cn(activeInvoiceIndex === index && 'bg-muted/50', 'cursor-pointer')}
                        >
                            <TableCell className="font-medium">{invoice.toName || 'Untitled'}</TableCell>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell className="capitalize">{invoice.documentType}</TableCell>
                            <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* Stop propagation to avoid row click handler */}
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewAs(index, 'invoice')}>View as Invoice</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewAs(index, 'receipt')}>View as Receipt</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewAs(index, 'deposit')}>View as Deposit</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setActiveInvoiceIndex(index); }}>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleRemoveInvoice(index);}}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      {invoices.length === 0 && !isLoading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Documents will appear here</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Your extracted documents will be listed here to edit and review.
            </p>
        </div>
      )}
    </div>
  );
}
