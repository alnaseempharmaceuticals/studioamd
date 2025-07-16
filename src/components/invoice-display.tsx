'use client';

import type { InvoiceOutput } from "@/ai/flows/format-invoice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownTable } from "@/components/markdown-table";
import { Separator } from "./ui/separator";

interface InvoiceDisplayProps {
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
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };
    
  return (
    <Card className="shadow-lg" id="invoice-section">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-headline">فاتورة</CardTitle>
                <CardDescription>رقم الفاتورة: #{invoiceNumber}</CardDescription>
            </div>
            <div className="text-left">
                <h3 className="font-semibold">العميل</h3>
                <p className="text-muted-foreground">{customerName}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <MarkdownTable markdown={output.formattedInvoice} />
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-3">
            <Separator />
            <div className="flex justify-between">
                <span className="text-muted-foreground">الإجمالي</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ المستلم</span>
                <span className="font-medium">{formatCurrency(amountReceived)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <span className="text-primary">المبلغ المتبقي</span>
                <span className="text-primary">{formatCurrency(output.balanceDue)}</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
