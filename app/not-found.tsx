import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="heading-1 mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-6">Page not found</p>
      <Link href="/">
        <Button>Go back home</Button>
      </Link>
    </div>
  );
}
