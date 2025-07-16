'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatInvoice, type InvoiceInput } from '@/ai/flows/format-invoice';
import { PlusCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';
import { exportToPdf } from '@/lib/pdf';

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0.01, 'Price must be greater than 0'),
});

const invoiceFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  items: z.array(itemSchema).min(1, 'At least one item must be added'),
  amountReceived: z.coerce.number().min(0, 'Amount received cannot be negative'),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<number>(1001);
  
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedInvoiceNumber = localStorage.getItem('invoiceNumber');
      if (savedInvoiceNumber) {
        setInvoiceNumber(parseInt(savedInvoiceNumber, 10));
      }
    } catch (error) {
      console.error("Could not access localStorage.", error);
    }
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: '',
      items: [{ name: '', quantity: 1, unitPrice: 0 }],
      amountReceived: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);
    
    const input: InvoiceInput = {
      ...data,
      invoiceNumber: invoiceNumber,
    };

    try {
      const result = await formatInvoice(input);
      const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) ?? 0;
      
      await exportToPdf({
        output: result,
        customerName: data.customerName,
        invoiceNumber: invoiceNumber,
        totalAmount: totalAmount,
        amountReceived: data.amountReceived
      });
      
      const nextInvoiceNumber = invoiceNumber + 1;
      setInvoiceNumber(nextInvoiceNumber);
      try {
        localStorage.setItem('invoiceNumber', nextInvoiceNumber.toString());
      } catch (error) {
         console.error("Could not access localStorage.", error);
      }
      reset();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate invoice. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      <header className="py-6 px-4 md:px-8">
        <div className="container mx-auto flex items-center gap-4">
            <AppLogo className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">InvoiceEase</h1>
                <p className="text-muted-foreground">AlNaseem Pharmacy</p>
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 md:px-8 pb-10 flex justify-center">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" {...register('customerName')} placeholder="e.g., John Doe" />
                  {errors.customerName && <p className="text-sm text-destructive">{errors.customerName.message}</p>}
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h3 className="font-medium text-lg">Items</h3>
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 border rounded-md relative">
                        <div className="space-y-1">
                          <Label htmlFor={`items.${index}.name`}>Item Name</Label>
                          <Input id={`items.${index}.name`} {...register(`items.${index}.name`)} placeholder="e.g., Aspirin" />
                          {errors.items?.[index]?.name && <p className="text-xs text-destructive">{errors.items[index]?.name?.message}</p>}
                        </div>
                         <div className="space-y-1">
                          <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                          <Input type="number" id={`items.${index}.quantity`} {...register(`items.${index}.quantity`)} defaultValue={1} />
                           {errors.items?.[index]?.quantity && <p className="text-xs text-destructive">{errors.items[index]?.quantity?.message}</p>}
                        </div>
                         <div className="space-y-1">
                          <Label htmlFor={`items.${index}.unitPrice`}>Price</Label>
                          <Input type="number" step="0.01" id={`items.${index}.unitPrice`} {...register(`items.${index}.unitPrice`)} />
                           {errors.items?.[index]?.unitPrice && <p className="text-xs text-destructive">{errors.items[index]?.unitPrice?.message}</p>}
                        </div>
                        <div className="flex items-end">
                            {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive">
                                <XCircle className="h-5 w-5" />
                                <span className="sr-only">Remove</span>
                            </Button>
                            )}
                        </div>
                      </div>
                    ))}
                     {errors.items?.root && <p className="text-sm text-destructive">{errors.items.root.message}</p>}
                     <Button type="button" variant="outline" onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}>
                        <PlusCircle className="me-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="amountReceived">Amount Received</Label>
                  <Input type="number" step="0.01" id="amountReceived" {...register('amountReceived')} />
                  {errors.amountReceived && <p className="text-sm text-destructive">{errors.amountReceived.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Invoice'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
