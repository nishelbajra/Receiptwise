import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus, Building2, Wallet } from "lucide-react";

export default function AccountsPage() {
  return (
    <>
      <Header title="Financial Accounts" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-400">Manage your bank accounts, credit cards, and payment methods</p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Add Credit Card */}
          <Card className="bg-slate-900 border-slate-800 border-dashed hover:border-slate-700 cursor-pointer transition-colors">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="font-medium text-slate-200 mb-1">Add Credit Card</h3>
                <p className="text-sm text-slate-500">Track rewards and benefits</p>
              </div>
            </CardContent>
          </Card>

          {/* Add Bank Account */}
          <Card className="bg-slate-900 border-slate-800 border-dashed hover:border-slate-700 cursor-pointer transition-colors">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Building2 className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-medium text-slate-200 mb-1">Add Bank Account</h3>
                <p className="text-sm text-slate-500">Connect checking or savings</p>
              </div>
            </CardContent>
          </Card>

          {/* Add Other */}
          <Card className="bg-slate-900 border-slate-800 border-dashed hover:border-slate-700 cursor-pointer transition-colors">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-3">
                  <Wallet className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-medium text-slate-200 mb-1">Other Account</h3>
                <p className="text-sm text-slate-500">Cash, digital wallets, etc.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Why add your accounts?</CardTitle>
            <CardDescription className="text-slate-400">
              Adding your financial accounts helps ReceiptWise provide better insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                <span>Link transactions to the correct payment method automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                <span>Get credit card reward recommendations based on your spending</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                <span>See spending breakdown by account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400">•</span>
                <span>Bank sync coming in a future update (Plaid integration)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
