import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Trash2 } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <>
      <Header title="Settings" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Profile */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-slate-100">Profile</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your account information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Name</Label>
                <Input
                  id="name"
                  defaultValue={session?.user?.name || ""}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={session?.user?.email || ""}
                  disabled
                  className="bg-slate-800 border-slate-700 text-slate-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-slate-300">Monthly Budget</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter your monthly budget"
                className="bg-slate-800 border-slate-700 text-slate-100 max-w-xs"
              />
              <p className="text-xs text-slate-500">Set a monthly spending limit to track your progress</p>
            </div>
            <Button className="bg-sky-500 hover:bg-sky-600">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-slate-100">Notifications</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure how you receive alerts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Spending Alerts</p>
                <p className="text-xs text-slate-500">Get notified when spending exceeds your average</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                Enable
              </Button>
            </div>
            <Separator className="bg-slate-800" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Budget Warnings</p>
                <p className="text-xs text-slate-500">Alert when approaching budget limits</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                Enable
              </Button>
            </div>
            <Separator className="bg-slate-800" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Weekly Summary</p>
                <p className="text-xs text-slate-500">Receive a weekly spending summary email</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-slate-100">Security</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your security settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Change Password</p>
                <p className="text-xs text-slate-500">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                Update
              </Button>
            </div>
            <Separator className="bg-slate-800" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Export Data</p>
                <p className="text-xs text-slate-500">Download all your financial data</p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-slate-900 border-rose-900/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-rose-400">Danger Zone</CardTitle>
                <CardDescription className="text-slate-400">
                  Irreversible actions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Delete Account</p>
                <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" size="sm" className="border-rose-800 text-rose-400 hover:bg-rose-500/10">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
