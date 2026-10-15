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
                title: "AI-Powered Extraction",
                description: "Gemini 2.5 Flash AI extracts merchant, items, totals, tax, and card details instantly.",
              },
              {
                icon: Brain,
                title: "Qwen spending assistant",
                description: "Ask questions about confirmed transactions. The model cannot invent or change records.",
              },
              {
                icon: PieChart,
                title: "Spending analytics",
                description: "See totals by month and category from transactions you actually confirmed.",
              },
              {
                icon: CreditCard,
                title: "Optional cards",
                description: "Save cards if you want. They are not required to track a receipt.",
              },
              {
                icon: Bell,
                title: "Budget status",
                description: "Set a monthly budget and ask the assistant how you are tracking.",
              },
              {
                icon: Shield,
                title: "Runs on your laptop",
                description: "App, OCR, and Qwen stay local for the student MVP. No per-request AI charges.",
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
            { step: "1", title: "Upload", description: "Photograph a receipt and store it privately on disk" },
            { step: "2", title: "Read", description: "Tesseract plus rules draft totals. Qwen cleans the merchant." },
            { step: "3", title: "Confirm", description: "Nothing is saved as spending until you review it" },
            { step: "4", title: "Ask", description: "Query confirmed records with the local assistant" },
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
