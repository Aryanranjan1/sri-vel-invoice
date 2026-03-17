'use client';

import * as React from 'react';
import { type InvoiceFormValues } from '@/types/invoice';
import { DefaultTemplate } from './invoice/templates/default-template';
import { SriVelsTemplate } from './invoice/templates/sri-vels-template';
import { EditorialTemplate } from './invoice/templates/editorial-template';

type InvoicePreviewProps = {
  data: InvoiceFormValues;
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    
    const renderTemplate = () => {
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
        <div ref={ref} className="bg-card shadow-lg rounded-lg">
            <div className='p-4 sm:p-6 md:p-10'>
                <div className="aspect-[210/297] flex flex-col">
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
  }
);
InvoicePreview.displayName = "InvoicePreview";
