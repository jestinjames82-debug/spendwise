import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">SpendWise</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-primary hidden sm:inline-block">
              Dashboard
            </Link>
            <Link href="/login" className="transition-colors hover:text-primary hidden sm:inline-block">
              Login
            </Link>
            <ThemeToggle />
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-medium transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
