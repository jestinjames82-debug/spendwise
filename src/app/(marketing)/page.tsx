import Link from "next/link";
import { ArrowRight, BarChart3, PieChart, ShieldCheck, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 inline-flex items-center">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          SpendWise v1.0 is here
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-foreground mb-6">
          Smart Personal Finance for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Modern Era</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Take control of your money with beautiful analytics, smart budgeting, and seamless transaction tracking. Built for clarity and speed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-primary/25"
          >
            Start for free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-card text-card-foreground hover:bg-muted border border-border h-14 px-8 rounded-full text-lg font-medium transition-all"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage your wealth</h2>
            <p className="text-muted-foreground text-lg">Powerful tools wrapped in a beautiful, intuitive interface.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Clear Analytics</h3>
              <p className="text-muted-foreground">Visualize your spending patterns with beautiful, interactive charts that make sense of your data.</p>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <PieChart className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Budgets</h3>
              <p className="text-muted-foreground">Set custom budgets for different categories and get notified before you overspend.</p>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-muted-foreground">Your financial data is yours. We use enterprise-grade security to keep your information safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">SpendWise</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
