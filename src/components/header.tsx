import Link from 'next/link';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold font-headline">Invoice Platform</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Button asChild variant="ghost">
          <Link href="/login">
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/invoice/new">
            Create Invoice
          </Link>
        </Button>
      </nav>
    </header>
  );
}
