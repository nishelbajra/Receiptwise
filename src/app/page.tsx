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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-gray-900">
              ReceiptWise
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="rounded-full bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-100 px-4 py-1.5 text-sm text-red-600 mb-6">
          <Brain className="h-4 w-4" />
          AI-Powered Financial Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-gray-900">
          Track spending with
          <br />
          <span className="text-red-500">intelligent receipt scanning</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Upload a receipt photo. Our AI extracts everything automatically. 
          Get real-time insights on your spending patterns and optimize your finances.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg font-medium transition-colors shadow-lg shadow-red-500/25"
          >
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            href="#features" 
            className="rounded-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 text-lg font-medium transition-colors"
          >
            See features
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to master your finances
            </h2>
            <p className="text-lg text-gray-500">
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
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:shadow-red-500/5 transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-500">
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500 text-white text-xl font-bold mb-4 shadow-lg shadow-red-500/25">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-500 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed how they track and understand their spending.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-gray-100 text-red-500 px-8 py-4 text-lg font-medium transition-colors"
          >
            <CheckCircle2 className="h-5 w-5" />
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="mx-auto max-w-7xl px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ReceiptWise. Built with Next.js, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
}
