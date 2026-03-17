'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return null;
  }
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
       <h1 className="text-3xl font-bold font-headline mb-8">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? ''} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{user.isAnonymous ? 'Guest User' : user.displayName || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
            
            <div>
                <h3 className="font-medium mb-2">User ID</h3>
                <p className="text-sm text-muted-foreground bg-secondary p-2 rounded-md font-mono">{user.uid}</p>
            </div>
             <div>
                <h3 className="font-medium mb-2">Email Verification</h3>
                <p className={`text-sm ${user.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                    {user.emailVerified ? 'Your email is verified.' : 'Your email is not verified.'}
                </p>
                {!user.emailVerified && !user.isAnonymous && (
                    <Button variant="link" className="p-0 h-auto">Send verification email</Button>
                )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
