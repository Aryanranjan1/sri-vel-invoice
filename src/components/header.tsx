'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { FileText, LogOut, User as UserIcon, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold font-headline">Invoice Platform</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        {isUserLoading ? (
          <Loader2 className="animate-spin" />
        ) : user ? (
          <>
            <Button asChild variant="ghost" className='hidden sm:inline-flex'>
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? ''} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.isAnonymous ? 'Guest User' : user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/account">
                    <UserIcon className="mr-2" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button asChild variant="ghost">
            <Link href="/login">
              Login
            </Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/invoice/new">
            Create Invoice
          </Link>
        </Button>
      </nav>
    </header>
  );
}
