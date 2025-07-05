
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, PlusCircle } from "lucide-react";
import { useState } from "react";
import ItemPurchase from "@/components/ItemPurchase";
import BorrowManagement from "@/components/BorrowManagement";
import IncomeExpense from "@/components/IncomeExpense";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sample data for demonstration
  const totalIncome = 15000;
  const totalExpense = 8000;
  const totalGain = totalIncome - totalExpense;

  const recentTransactions = [
    { id: 1, type: "Income", amount: 700, category: "Sales", date: "Today" },
    { id: 2, type: "Expense", amount: 200, category: "Travel", date: "Today" },
    { id: 3, type: "Income", amount: 1200, category: "Sales", date: "Yesterday" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "purchases":
        return <ItemPurchase />;
      case "borrow":
        return <BorrowManagement />;
      case "income-expense":
        return <IncomeExpense />;
      default:
        return (
          <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">വരുമാനം / Income</p>
                      <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ചെലവ് / Expense</p>
                      <p className="text-2xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ലാഭം / Gain</p>
                      <p className="text-2xl font-bold text-blue-600">₹{totalGain.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === "Income" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <div>
                          <p className="font-medium">{transaction.category}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === "Income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "Income" ? "+" : "-"}₹{transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("income-expense")}>
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Shop Sahai</h1>
            </div>
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Voice Input
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 space-y-2">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Navigation</h2>
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: DollarSign },
                  { id: "purchases", label: "Item Purchase", icon: ShoppingCart },
                  { id: "borrow", label: "Borrow Management", icon: Users },
                  { id: "income-expense", label: "Income & Expense", icon: TrendingUp },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
