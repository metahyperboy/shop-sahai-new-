
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, PlusCircle, Settings } from "lucide-react";
import { useState } from "react";
import ItemPurchase from "@/components/ItemPurchase";
import BorrowManagement from "@/components/BorrowManagement";
import IncomeExpense from "@/components/IncomeExpense";
import UserSettings from "@/components/UserSettings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false);

  // Sample data for demonstration
  const totalIncome = 15000;
  const totalExpense = 8000;
  const totalGain = totalIncome - totalExpense;

  const recentTransactions = [
    { id: 1, type: "Income", amount: 700, category: "Sales", date: "Today" },
    { id: 2, type: "Expense", amount: 200, category: "Travel", date: "Today" },
    { id: 3, type: "Income", amount: 1200, category: "Sales", date: "Yesterday" },
  ];

  const navigationItems = [
    { id: "dashboard", label: "Home", icon: DollarSign },
    { id: "purchases", label: "Purchase", icon: ShoppingCart },
    { id: "borrow", label: "Borrow", icon: Users },
    { id: "income-expense", label: "Expense", icon: TrendingUp },
  ];

  const renderContent = () => {
    if (showSettings) {
      return <UserSettings onClose={() => setShowSettings(false)} />;
    }

    switch (activeTab) {
      case "purchases":
        return <ItemPurchase />;
      case "borrow":
        return <BorrowManagement />;
      case "income-expense":
        return <IncomeExpense />;
      default:
        return (
          <div className="space-y-4 p-4">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">വരുമാനം / Income</p>
                      <p className="text-lg font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">ചെലവ് / Expense</p>
                      <p className="text-lg font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
                    </div>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">ലാഭം / Gain</p>
                      <p className="text-lg font-bold text-blue-600">₹{totalGain.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === "Income" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{transaction.category}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${
                        transaction.type === "Income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "Income" ? "+" : "-"}₹{transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-3 text-sm" onClick={() => setActiveTab("income-expense")}>
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Shop Sahai</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Hi, User</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(true)}
            className="p-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </div>

      {/* Voice Input Button - Floating */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button className="rounded-full w-12 h-12 shadow-lg">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
