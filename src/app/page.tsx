'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { ManualInvoiceGenerator } from '@/components/manual-invoice-generator';
import { AiInvoiceWizard } from '@/components/ai-invoice-wizard';
import { InvoicePreview } from '@/components/invoice-preview';
import { type InvoiceFormValues, invoiceFormSchema } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Bot, File as FileIcon, Download, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoicePage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const { toast } = useToast();
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const defaultValues: Partial<InvoiceFormValues> = {
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    fromName: 'Sri Vels Catering',
    fromRegNo: '202503053810 (JR0174329-K)',
    fromEmail: '',
    fromAddress: '6580 SEMPADAN KG DATO MANSU\nGPASIR RASAH SEREMBAN\n70300 SEREMBAN, NEGERI SEMBILAN',
    toName: '',
    toEmail: '',
    toAddress: '',
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: 'Thank you for your business. Payment is strictly due within 7 days of the invoice date.',
    taxRate: 8,
    discountRate: 0,
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

  const watchedManualData = manualForm.watch();

  const [aiInvoices, setAiInvoices] = useState<InvoiceFormValues[]>([]);
  const [activeAiInvoiceIndex, setActiveAiInvoiceIndex] = useState<number | null>(null);

  let previewData: InvoiceFormValues | null = null;
  if (mode === 'manual') {
    previewData = watchedManualData;
  } else if (activeAiInvoiceIndex !== null && aiInvoices[activeAiInvoiceIndex]) {
    previewData = aiInvoices[activeAiInvoiceIndex];
  }

  const handleDownload = async () => {
    if (!invoicePreviewRef.current || !previewData) {
      toast({
        variant: 'destructive',
        title: 'Preview Not Found',
        description: 'Cannot download invoice because the preview is not available.',
      });
      return;
    }

    toast({
      title: 'Generating PDF...',
      description: 'Your invoice is being prepared for download.',
    });

    try {
      const canvas = await html2canvas(invoicePreviewRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasAspectRatio = canvas.width / canvas.height;
      let imgWidth = pdfWidth;
      let imgHeight = pdfWidth / canvasAspectRatio;

      if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * canvasAspectRatio;
      }
      
      const xOffset = (pdfWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${previewData.invoiceNumber || 'download'}.pdf`);

      toast({
        title: 'Download Started!',
        description: 'Your invoice PDF has been successfully generated.',
      });
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'An unexpected error occurred while generating the PDF.',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-12">
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-semibold tracking-tight">Sri Vels <span className="text-muted-foreground font-normal">/ Invoice</span></h1>
        </div>
        
        <div className="bg-muted p-1 rounded-lg inline-flex items-center justify-center mx-auto sm:mx-0">
            <button 
              onClick={() => setMode('manual')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                mode === 'manual' ? 'bg-background text-foreground shadow-sm' : 'bg-transparent text-muted-foreground'
              )}
            >
              Manual
            </button>
            <button 
              onClick={() => setMode('ai')}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                mode === 'ai' ? 'bg-background text-foreground shadow-sm' : 'bg-transparent text-muted-foreground'
              )}
            >
              <Bot size={16} /> AI Parse
            </button>
        </div>
        
        <div className="text-center sm:text-right">
          <Button onClick={handleDownload} disabled={!previewData}>
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 items-start">
        {/* LEFT PANEL */}
        <div className="space-y-10">
          {mode === 'manual' && (
            <ManualInvoiceGenerator form={manualForm} />
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
          <div className="bg-card rounded-lg shadow-lg p-4">
              <div ref={invoicePreviewRef}>
                {previewData ? (
                  <InvoicePreview data={previewData} />
                ) : (
                  <div className="aspect-[210/297] flex items-center justify-center text-center text-muted-foreground bg-secondary/30 rounded-md">
                    <div className="space-y-2">
                        <FileIcon className="mx-auto h-12 w-12" />
                        <p className="font-medium">No invoice to display</p>
                        <p className="text-xs">
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
  );
}
