"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/services/apiClient';
import PlaygroundLayout from '@/components/playground/Layout';
import { useWorkspaces } from '@/hooks/useWorkspace';

interface Invoice {
  id: number;
  subscription_id: number;
  amount: number;
  currency: string;
  status: string;
  invoice_pdf_url: string | null;
  invoice_date: string;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
}

export default function InvoicesPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { toast } = useToast();
  const { workspaces } = useWorkspaces();
  const currentWorkspace = workspaces.find((ws: { id: string; name: string }) => ws.id === workspaceId) || { id: workspaceId, name: 'Workspace' };
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // Call API to fetch invoices for the workspace
        const numericWorkspaceId = parseInt(workspaceId);
        const data = await apiClient<Invoice[]>(`/api/v1/subscriptions/workspaces/${numericWorkspaceId}/invoices`, {
          method: 'GET'
        });
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoices. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [workspaceId, toast]);

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbol = currency.toLowerCase() === 'eur' ? '€' : 
                          currency.toLowerCase() === 'usd' ? '$' : 
                          currency;
    return `${currencySymbol}${amount}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-500 bg-green-100 dark:bg-green-900 dark:bg-opacity-20';
      case 'open':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20';
      case 'draft':
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:bg-opacity-20';
      case 'uncollectible':
      case 'void':
        return 'text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:bg-opacity-20';
    }
  };

  return (
    <PlaygroundLayout
      title="Billing History"
      currentWorkspace={{
        id: workspaceId,
        name: currentWorkspace?.name || 'Workspace'
      }}
      description="View and download your past invoices"
    >
      <div className="container py-4">
      
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Your billing history and invoice details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">INV-{invoice.id}</TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.invoice_pdf_url ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(invoice.invoice_pdf_url!, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <FileText className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are no invoices for this workspace yet. They will appear here once you have an active subscription.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </PlaygroundLayout>
  );
}
