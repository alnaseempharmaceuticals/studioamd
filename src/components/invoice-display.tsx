'use client';

import type { InvoiceOutput } from "@/ai/flows/format-invoice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownTable } from "@/components/markdown-table";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const exportToPdf = () => {
    const invoiceElement = document.getElementById('invoice-section-to-print');
    if (invoiceElement) {
      // Temporarily change title for PDF export
      const cardTitle = invoiceElement.querySelector('[data-title="invoice-title"]') as HTMLElement;
      const originalTitle = cardTitle?.innerText;
      if (cardTitle) {
        cardTitle.innerText = 'AlNaseem';
      }

      html2canvas(invoiceElement, {
        scale: 2, // Increase scale for better quality
        useCORS: true, 
        scrollY: -window.scrollY, // Fix for capturing only visible area
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight
      }).then(canvas => {
         // Change title back after canvas is created
        if (cardTitle && originalTitle) {
          cardTitle.innerText = originalTitle;
        }

        const imgData = canvas.toDataURL('image/png');
        
        // A5 dimensions in mm: 148 x 210
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let finalCanvasWidth = pdfWidth;
        let finalCanvasHeight = pdfWidth / canvasAspectRatio;

        if (finalCanvasHeight > pdfHeight) {
          finalCanvasHeight = pdfHeight;
          finalCanvasWidth = pdfHeight * canvasAspectRatio;
        }
        
        const x = (pdfWidth - finalCanvasWidth) / 2;
        const y = (pdfHeight - finalCanvasHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalCanvasWidth, finalCanvasHeight, undefined, 'FAST');
        pdf.save(`invoice-${invoiceNumber}.pdf`);
      });
    }
  };
    
  return (
    <Card className="shadow-lg" id="invoice-section">
      <div id="invoice-section-to-print" className="bg-card text-card-foreground">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="text-2xl font-headline" data-title="invoice-title">Invoice</CardTitle>
                  <CardDescription>Invoice No: #{invoiceNumber}</CardDescription>
              </div>
              <div className="text-right">
                  <h3 className="font-semibold">Customer</h3>
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
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
               <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Received</span>
                  <span className="font-medium">{formatCurrency(amountReceived)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                  <span className="text-primary">Balance Due</span>
                  <span className="text-primary">{formatCurrency(output.balanceDue)}</span>
              </div>
          </div>
        </CardFooter>
      </div>
       <CardFooter className="border-t pt-6">
        <Button onClick={exportToPdf} className="w-full">
          <Download className="me-2 h-4 w-4" />
          Export as PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
