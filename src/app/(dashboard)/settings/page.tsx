import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Shield, Trash2 } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Settings" />
      
      <div className="p-6 max-w-3xl space-y-6">
        {/* Profile */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <User className="h-5 w-5 text-red-500" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ""}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ""}
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Monthly Budget</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>
            <button className="rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 font-medium transition-colors">
              Save Changes
            </button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Bell className="h-5 w-5 text-red-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Spending alerts", description: "Get notified when spending is above average" },
              { label: "Budget warnings", description: "Alert when approaching budget limit" },
              { label: "Weekly summary", description: "Receive weekly spending summary email" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <button className="w-12 h-6 rounded-full bg-gray-200 relative transition-colors hover:bg-gray-300">
                  <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Shield className="h-5 w-5 text-red-500" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <p className="text-gray-900 font-medium">Change Password</p>
              <p className="text-sm text-gray-500">Update your password</p>
            </button>
            <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <p className="text-gray-900 font-medium">Export Data</p>
              <p className="text-sm text-gray-500">Download all your data</p>
            </button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-white border-red-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="rounded-full border border-red-500 text-red-500 hover:bg-red-50 px-6 py-2.5 font-medium transition-colors">
              Delete Account
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
