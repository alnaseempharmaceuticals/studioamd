'use client';

import type { InvoiceOutput } from "@/ai/flows/format-invoice";
import { MarkdownTable } from "@/components/markdown-table";

export interface InvoiceDisplayProps {
  output: InvoiceOutput;
  customerName: string;
  invoiceNumber: number;
  totalAmount: number;
  amountReceived: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function InvoiceForPdf({ 
  output, 
  customerName, 
  invoiceNumber,
  totalAmount,
  amountReceived
}: InvoiceDisplayProps) {
  return (
    <div id="invoice-section-to-print" className="bg-white text-black p-6 rounded-lg border font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AlNaseem</h2>
          <p className="text-gray-600">Invoice No: #{invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h3 className="font-semibold text-gray-800">Customer</h3>
          <p className="text-gray-500">{customerName}</p>
        </div>
      </div>
      <div className="mt-6">
        <MarkdownTable markdown={output.formattedInvoice} />
      </div>
      <div className="mt-6">
        <div className="w-full space-y-3">
            <hr className="border-gray-300" />
            <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-medium text-gray-800">{formatCurrency(totalAmount)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-500">Amount Received</span>
                <span className="font-medium text-gray-800">{formatCurrency(amountReceived)}</span>
            </div>
            <hr className="border-gray-300"/>
            <div className="flex justify-between font-bold text-lg">
                <span className="text-blue-600">Balance Due</span>
                <span className="text-blue-600">{formatCurrency(output.balanceDue)}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
