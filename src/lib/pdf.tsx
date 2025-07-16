'use client';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from 'react-dom/client';
import { InvoiceForPdf, type InvoiceDisplayProps } from "@/components/invoice-display";

export const exportToPdf = (props: InvoiceDisplayProps) => {
    return new Promise<void>(async (resolve) => {
        const invoiceContainer = document.createElement('div');
        invoiceContainer.style.position = 'absolute';
        invoiceContainer.style.left = '-9999px';
        invoiceContainer.style.width = '800px';
        document.body.appendChild(invoiceContainer);

        const root = createRoot(invoiceContainer);
        root.render(<InvoiceForPdf {...props} />);

        // Allow time for the component to render
        setTimeout(async () => {
            const invoiceElement = invoiceContainer.querySelector<HTMLElement>('#invoice-section-to-print');
            
            if (invoiceElement) {
                const canvas = await html2canvas(invoiceElement, {
                    scale: 2,
                    useCORS: true,
                });

                const imgData = canvas.toDataURL('image/png');
                
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
                pdf.save(`invoice-${props.invoiceNumber}.pdf`);
            }

            // Clean up
            root.unmount();
            document.body.removeChild(invoiceContainer);
            resolve();
        }, 500); // A short delay to ensure rendering is complete
    });
};
