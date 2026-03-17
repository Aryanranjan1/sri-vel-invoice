import Link from 'next/link';
import { FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center md:text-left">
            <FileText className="h-5 w-5 text-primary hidden sm:block" />
            <p className="text-sm text-muted-foreground">&copy; 2024 Invoice Platform. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/contact" className="text-sm hover:underline underline-offset-4 text-muted-foreground">
              Contact
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4 text-muted-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4 text-muted-foreground">
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
