'use client';

import { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';
import { type InvoiceFormValues } from '@/types/invoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface AIInvoiceExtractorProps {
  form: UseFormReturn<InvoiceFormValues>;
}

export function AIInvoiceExtractor({ form }: AIInvoiceExtractorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [unstructuredText, setUnstructuredText] = useState('');

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
    try {
      const { invoices } = await extractInvoiceData({ unstructuredData: unstructuredText });
      
      if (!invoices || invoices.length === 0) {
        throw new Error('The AI could not detect any invoice data.');
      }
      
      const extracted = invoices[0]; // Use the first detected invoice
      const currentFormValues = form.getValues();

      const newItems = extracted.items && extracted.items.length > 0 
        ? extracted.items.map(item => ({
            description: item.name || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
          }))
        : currentFormValues.items;

      const invoiceDate = extracted.date ? new Date(extracted.date) : new Date();
       // Adjust for timezone offset to prevent date from being off by one day
      const timeZoneOffset = invoiceDate.getTimezoneOffset() * 60000;
      const adjustedInvoiceDate = new Date(invoiceDate.getTime() + timeZoneOffset);


      const dueDate = new Date(adjustedInvoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      form.reset({
        ...currentFormValues,
        toName: extracted.clientName || currentFormValues.toName,
        notes: [extracted.title, extracted.notes].filter(Boolean).join('\n\n') || currentFormValues.notes,
        items: newItems,
        invoiceDate: adjustedInvoiceDate,
        dueDate: dueDate,
      });

      toast({
        title: 'Data Extracted!',
        description: 'The invoice form has been populated with the AI-generated data.',
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

  return (
    <Card className="bg-secondary/30 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent"/>
            Create with AI
        </CardTitle>
        <CardDescription>
            Paste in any text—like an email, a receipt, or a list of items—and let AI fill out the invoice for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., Lunch with PJ Temple on 24/3. Items: 2x Burger, 1x Fries. Total was $25.50"
          value={unstructuredText}
          onChange={(e) => setUnstructuredText(e.target.value)}
          className="min-h-[120px] bg-background"
          disabled={isLoading}
        />
        <Button onClick={handleExtract} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
             <Sparkles className="mr-2" />
              Extract & Populate Form
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
