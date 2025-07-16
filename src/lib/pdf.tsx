import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { renderToStaticMarkup } from 'react-dom/server';
import { InvoiceDisplay, type InvoiceDisplayProps } from "@/components/invoice-display";

export const exportToPdf = async (props: InvoiceDisplayProps) => {
    // Create a hidden element to render the component
    const invoiceContainer = document.createElement('div');
    invoiceContainer.style.position = 'absolute';
    invoiceContainer.style.left = '-9999px';
    invoiceContainer.style.width = '800px'; // A fixed width for consistent rendering
    document.body.appendChild(invoiceContainer);

    // Render the React component to an HTML string and set it
    const invoiceHtml = renderToStaticMarkup(<InvoiceDisplay {...props} />);
    invoiceContainer.innerHTML = invoiceHtml;
    
    // Find the specific element to print
    const invoiceElement = invoiceContainer.querySelector<HTMLElement>('#invoice-section-to-print');
    
    if (invoiceElement) {
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Increase scale for better quality
            useCORS: true,
        });

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
        pdf.save(`invoice-${props.invoiceNumber}.pdf`);
    }

    // Clean up the hidden element
    document.body.removeChild(invoiceContainer);
};
