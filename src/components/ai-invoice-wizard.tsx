'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, Trash2, Edit } from 'lucide-react';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';
import { type InvoiceFormValues } from '@/types/invoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { EditableInvoiceForm } from './editable-invoice-form';
import { cn } from '@/lib/utils';


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
      setActiveInvoiceIndex(0); // Select the first invoice by default

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

  if (editingIndex !== null) {
    return (
      <div>
        <Button variant="outline" onClick={() => setEditingIndex(null)} className="mb-4">
            &larr; Back to Invoice List
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
                Paste your informal chat logs, emails, or fragmented notes. The parser will automatically structure the data into one or more invoices.
            </p>
        </div>

        <Textarea
        placeholder="e.g., Matthene wants 100 pax lunch on the 17th. RM7.20 each. Include Podelanga. Apply 8% tax."
        value={unstructuredText}
        onChange={(e) => setUnstructuredText(e.target.value)}
        className="min-h-[150px] bg-card"
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
            Process & Extract Invoices
            </>
        )}
        </Button>

      {invoices.length > 0 && (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Extracted Invoices</h3>
            <div className="space-y-3">
                {invoices.map((invoice, index) => (
                    <Card 
                        key={index}
                        onClick={() => setActiveInvoiceIndex(index)}
                        className={cn(
                            "cursor-pointer transition-all",
                            activeInvoiceIndex === index ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'
                        )}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="font-medium">
                                <p>{invoice.toName || 'Untitled Invoice'}</p>
                                <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingIndex(index); setActiveInvoiceIndex(index); }}>
                                    <Edit size={16}/>
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleRemoveInvoice(index); }}>
                                    <Trash2 size={16}/>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}

      {invoices.length === 0 && !isLoading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Invoices will appear here</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Your extracted invoices will be listed here to edit and review.
            </p>
        </div>
      )}
    </div>
  );
}
