'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManualInvoiceGenerator } from '@/components/manual-invoice-generator';
import { AiInvoiceWizard } from '@/components/ai-invoice-wizard';
import { File, Bot } from 'lucide-react';

export default function InvoicePage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-headline">Invoice Generator</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Create, manage, and export professional invoices in seconds.
          </p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">
            <File className="mr-2"/>
            Manual Mode
            </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="mr-2" />
            AI Mode
            </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="pt-6">
          <ManualInvoiceGenerator />
        </TabsContent>
        <TabsContent value="ai" className="pt-6">
          <AiInvoiceWizard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
