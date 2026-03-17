'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <Button asChild>
          <Link href="/invoice/new">
            <PlusCircle className="mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Invoices</CardTitle>
          <CardDescription>Here are all the invoices you have created.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">You haven't created any invoices yet.</p>
            <Button asChild variant="link">
              <Link href="/invoice/new">Create your first invoice</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
