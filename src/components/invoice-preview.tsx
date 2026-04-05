'use client';

import * as React from 'react';
import { type InvoiceFormValues } from '@/types/invoice';
import { DefaultTemplate } from './invoice/templates/default-template';
import { SriVelsTemplate } from './invoice/templates/sri-vels-template';
import { EditorialTemplate } from './invoice/templates/editorial-template';
import { ReceiptTemplate } from './invoice/templates/receipt-template';
import { SriVelsReceiptTemplate } from './invoice/templates/sri-vels-receipt-template';
import { EditorialReceiptTemplate } from './invoice/templates/editorial-receipt-template';
import { DepositTemplate } from './invoice/templates/deposit-template';
import { SriVelsDepositTemplate } from './invoice/templates/sri-vels-deposit-template';
import { EditorialDepositTemplate } from './invoice/templates/editorial-deposit-template';

type InvoicePreviewProps = {
  data: InvoiceFormValues;
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    
    const renderTemplate = () => {
      if (data.documentType === 'receipt') {
        switch (data.template) {
          case 'sri-vels':
            return <SriVelsReceiptTemplate data={data} />;
          case 'editorial':
            return <EditorialReceiptTemplate data={data} />;
          case 'default':
          default:
            return <ReceiptTemplate data={data} />;
        }
      }

      if (data.documentType === 'deposit') {
        switch (data.template) {
          case 'sri-vels':
            return <SriVelsDepositTemplate data={data} />;
          case 'editorial':
            return <EditorialDepositTemplate data={data} />;
          case 'default':
          default:
            return <DepositTemplate data={data} />;
        }
      }
      
      switch (data.template) {
        case 'sri-vels':
          return <SriVelsTemplate data={data} />;
        case 'editorial':
          return <EditorialTemplate data={data} />;
        case 'default':
        default:
          return <DefaultTemplate data={data} />;
      }
    };

    return (
      <div ref={ref} className="bg-card">
        <div data-invoice-paper className="w-full flex flex-col bg-white">
          {renderTemplate()}
        </div>
      </div>
    );
  }
);
InvoicePreview.displayName = "InvoicePreview";
