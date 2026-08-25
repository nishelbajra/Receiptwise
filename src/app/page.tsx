import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Receipt, 
  Brain, 
  PieChart, 
  CreditCard, 
  Bell, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Wallet
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-sky-400" />
            <span className="text-xl font-bold">
              <span className="text-sky-400">Receipt</span>
              <span className="text-slate-100">Wise</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-1.5 text-sm text-sky-400 mb-6">
          <Brain className="h-4 w-4" />
          AI-Powered Financial Intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="text-slate-100">Track spending with</span>
          <br />
          <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
            intelligent receipt scanning
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Upload a receipt photo. Our AI extracts everything automatically. 
          Get real-time insights on your spending patterns and optimize your finances.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 text-lg font-medium transition-colors"
          >
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            href="#features" 
            className="rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-6 py-3 text-lg font-medium transition-colors"
          >
            See features
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Everything you need to master your finances
          </h2>
          <p className="text-lg text-slate-400">
            Powerful features designed to give you complete control over your spending
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Receipt,
              title: "Smart Receipt Scanning",
              description: "Take a photo of any receipt. Our AI extracts merchant, items, totals, and categorizes automatically.",
            },
            {
              icon: Brain,
              title: "AI Financial Assistant",
              description: "Ask questions about your spending in plain English. Get instant, accurate answers from your actual data.",
            },
            {
              icon: PieChart,
              title: "Spending Analytics",
              description: "Visualize where your money goes with beautiful charts and actionable insights.",
            },
            {
              icon: CreditCard,
              title: "Card Reward Optimization",
              description: "Track your credit cards and get suggestions for which card to use for maximum rewards.",
            },
            {
              icon: Bell,
              title: "Proactive Alerts",
              description: "Get notified about unusual spending, budget limits, and important financial events.",
            },
            {
              icon: Shield,
              title: "Bank-Grade Security",
              description: "Your financial data is encrypted at rest and in transit. We never sell your data.",
            },
          ].map((feature) => (
            <div 
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-sky-500/10 text-sky-400 mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-400">
            From receipt to insight in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "1", title: "Upload", description: "Take a photo or upload a PDF of your receipt" },
            { step: "2", title: "Extract", description: "AI reads and extracts all transaction details" },
            { step: "3", title: "Confirm", description: "Review and edit if needed, then save" },
            { step: "4", title: "Insight", description: "See your dashboard update with new insights" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500 text-white text-xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{item.title}</h3>
              <p className="text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="rounded-2xl bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-sky-500/20 p-12 text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed how they track and understand their spending.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 text-lg font-medium transition-colors"
          >
            <CheckCircle2 className="h-5 w-5" />
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ReceiptWise. Built with Next.js, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
}
