import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-invoice');

  return (
    <section className="w-full h-full flex items-center justify-center py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Frictionless Invoice Generation
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
              Create, manage, and export professional invoices in seconds. No account required to start.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/invoice/new">
                Create Your First Invoice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              width={600}
              height={450}
              className="rounded-xl shadow-2xl aspect-[4/3] object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
        </div>
      </div>
    </section>
  );
}
