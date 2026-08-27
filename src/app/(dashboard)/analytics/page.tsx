import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Analytics" />
      
      <div className="p-6 space-y-6">
        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <PieChart className="h-5 w-5 text-red-500" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <PieChart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">
                  Add transactions to see category breakdown
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Spending Over Time */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Spending Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">
                  Track your spending trends over time
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-5 w-5 text-red-500" />
                Monthly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">
                  Compare spending across months
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-red-500" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">
                  View daily spending on a calendar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
