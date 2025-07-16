'use client';

import type { InvoiceOutput } from "@/ai/flows/format-invoice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownTable } from "@/components/markdown-table";
import { Separator } from "./ui/separator";

export interface InvoiceDisplayProps {
  output: InvoiceOutput;
  customerName: string;
  invoiceNumber: number;
  totalAmount: number;
  amountReceived: number;
}

export function InvoiceDisplay({ 
  output, 
  customerName, 
  invoiceNumber,
  totalAmount,
  amountReceived
}: InvoiceDisplayProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
    
  return (
    <Card className="shadow-lg" id="invoice-section">
      <div id="invoice-section-to-print" className="bg-white text-black">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="text-2xl font-headline" data-title="invoice-title">AlNaseem</CardTitle>
                  <CardDescription className="text-gray-600">Invoice No: #{invoiceNumber}</CardDescription>
              </div>
              <div className="text-right">
                  <h3 className="font-semibold">Customer</h3>
                  <p className="text-gray-500">{customerName}</p>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <MarkdownTable markdown={output.formattedInvoice} />
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-3">
              <Separator className="bg-gray-300" />
              <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
               <div className="flex justify-between">
                  <span className="text-gray-500">Amount Received</span>
                  <span className="font-medium">{formatCurrency(amountReceived)}</span>
              </div>
              <Separator className="bg-gray-300"/>
              <div className="flex justify-between font-bold text-lg">
                  <span className="text-blue-600">Balance Due</span>
                  <span className="text-blue-600">{formatCurrency(output.balanceDue)}</span>
              </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
