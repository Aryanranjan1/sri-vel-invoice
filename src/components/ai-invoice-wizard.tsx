'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Download, FileText } from 'lucide-react';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';
import { type InvoiceFormValues } from '@/types/invoice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion } from '@/components/ui/accordion';
import { EditableInvoiceForm } from './editable-invoice-form';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoicePreview } from './invoice-preview';

export function AiInvoiceWizard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
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

  const handleDownloadAll = () => {
    if (invoices.length === 0 || isBulkDownloading) return;
    toast({ title: 'Preparing bulk download...', description: `Generating a single PDF for all ${invoices.length} invoices.` });
    setIsBulkDownloading(true);
  }

  useEffect(() => {
    if (!isBulkDownloading) return;

    const generatePdf = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const previewElements = document.querySelectorAll('[data-print-preview-id]');

        for (let i = 0; i < previewElements.length; i++) {
            const invoiceElement = previewElements[i] as HTMLElement;
            if (!invoiceElement) continue;

            const canvas = await html2canvas(invoiceElement, {
                scale: 2.5,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const canvasAspectRatio = canvas.width / canvas.height;
            
            const padding = 10;
            const usableWidth = pdfWidth - (2 * padding);
            const usableHeight = pdfHeight - (2 * padding);

            let imgWidth = usableWidth;
            let imgHeight = imgWidth / canvasAspectRatio;

            if (imgHeight > usableHeight) {
                imgHeight = usableHeight;
                imgWidth = imgHeight * canvasAspectRatio;
            }

            const xOffset = (pdfWidth - imgWidth) / 2;
            const yOffset = (pdfHeight - imgHeight) / 2;
            
            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        }

        pdf.save(`invoices-bulk-${Date.now()}.pdf`);
        toast({ title: 'Bulk Download Started!', description: `Your PDF with ${invoices.length} invoices is being downloaded.` });
        setIsBulkDownloading(false);
    };

    // Use a short timeout to ensure the DOM has updated with the hidden previews
    const timer = setTimeout(generatePdf, 100);

    return () => clearTimeout(timer);
  }, [isBulkDownloading, invoices, toast]);


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
            disabled={isLoading || isBulkDownloading}
          />
          <Button onClick={handleExtract} disabled={isLoading || !unstructuredText || isBulkDownloading} className="w-full sm:w-auto">
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
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold font-headline">Extracted Invoices</h2>
                 <Button onClick={handleDownloadAll} disabled={isBulkDownloading}>
                     {isBulkDownloading ? (
                         <><Loader2 className="mr-2 animate-spin" /> Generating PDF...</>
                     ) : (
                         <><Download className="mr-2" /> Download All as PDF</>
                     )}
                 </Button>
            </div>
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
                    Once you paste text and click extract, you can edit and download each invoice individually or all at once.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      {/* Hidden container for reliable bulk PDF generation */}
      {isBulkDownloading && (
        <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
            {invoices.map((invoice, index) => (
                <div key={index} data-print-preview-id={index}>
                    <InvoicePreview data={invoice} template={invoice.template} />
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
