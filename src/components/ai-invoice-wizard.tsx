'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';
import { type InvoiceFormValues } from '@/types/invoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion } from '@/components/ui/accordion';
import { EditableInvoiceForm } from './editable-invoice-form';

export function AiInvoiceWizard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [unstructuredText, setUnstructuredText] = useState('');
  const [invoices, setInvoices] = useState<InvoiceFormValues[]>([]);

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
          invoiceNumber: `INV-${String(Date.now()).slice(-6)}-${index}`,
          fromName: '',
          fromRegNo: '',
          fromEmail: '',
          fromAddress: '',
          toName: extracted.clientName || '',
          toEmail: '',
          toAddress: '',
          notes: [extracted.title, extracted.notes].filter(Boolean).join('\n\n') || 'Thank you for your business.',
          items: extracted.items.map(item => ({
            description: item.name || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
          })),
          invoiceDate: adjustedInvoiceDate,
          dueDate: dueDate,
          taxRate: 8,
          discountRate: 0,
          template: 'modern',
          paymentDetails: {
            bankName: 'MAYBANK',
            accountName: 'SRI VELS CATERING',
            accountNumber: '555015029067',
            paymentMethod: 'Bank Transfer',
          },
        };
      });

      setInvoices(mappedInvoices);

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


  return (
    <div className="space-y-8">
      <Card className="bg-secondary/30 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="text-accent"/>
              AI Bulk Invoice Creation
          </CardTitle>
          <CardDescription>
              Paste any text containing one or more invoices—like a list, a chat history, or copied tables—and let AI create them all for you instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Lunch with PJ Temple on 24/3. 2 Burger, 1 Fries. Total $25.50. Dinner with Sarah on 25/3. 1 Pasta, 1 Salad. Total $35."
            value={unstructuredText}
            onChange={(e) => setUnstructuredText(e.target.value)}
            className="min-h-[150px] bg-background"
            disabled={isLoading}
          />
          <Button onClick={handleExtract} disabled={isLoading || !unstructuredText} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Extracting Invoices...
              </>
            ) : (
              <>
               <Sparkles className="mr-2" />
                Extract & Populate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {invoices.length > 0 && (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6">Extracted Invoices</h2>
            <Accordion type="multiple" className="w-full space-y-4">
                {invoices.map((invoice, index) => (
                    <EditableInvoiceForm 
                        key={index} 
                        index={index}
                        initialData={invoice} 
                        onUpdate={(data) => handleUpdateInvoice(index, data)}
                    />
                ))}
            </Accordion>
        </div>
      )}

      {invoices.length === 0 && !isLoading && (
        <Card className="text-center py-12">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">Your extracted invoices will appear here</CardTitle>
                <CardDescription>
                    Once you paste text and click extract, you can edit and download each invoice individually.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
