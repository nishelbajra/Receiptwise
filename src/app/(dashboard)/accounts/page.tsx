import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Building2, Wallet, Plus, Info } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Accounts" />
      
      <div className="p-6 space-y-6">
        {/* Add Account Options */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Credit Card</h3>
              <p className="text-sm text-gray-500">Track rewards and spending</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Bank Account</h3>
              <p className="text-sm text-gray-500">Checking or savings</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Other</h3>
              <p className="text-sm text-gray-500">Cash, digital wallet, etc.</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900">Your Accounts</CardTitle>
            <button className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No accounts added yet</p>
              <p className="text-sm text-gray-400 text-center max-w-md">
                Add your credit cards and bank accounts to track spending across all your payment methods
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Why add accounts?</h4>
                <p className="text-sm text-gray-500">
                  Adding your payment methods helps us track which card you used for each transaction. 
                  For credit cards, we can also help you optimize rewards by suggesting the best card 
                  for each purchase category.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
