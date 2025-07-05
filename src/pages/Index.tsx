
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Mic, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import ItemPurchase from "@/components/ItemPurchase";
import BorrowManagement from "@/components/BorrowManagement";
import IncomeExpense from "@/components/IncomeExpense";
import UserSettings from "@/components/UserSettings";
import VoiceAssistant from "@/components/VoiceAssistant";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [userName, setUserName] = useState("User");

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    { 
      id: "dashboard", 
      label: language === "malayalam" ? "ഹോം" : "Home", 
      icon: DollarSign 
    },
    { 
      id: "purchases", 
      label: language === "malayalam" ? "വാങ്ങൽ" : "Purchase", 
      icon: ShoppingCart 
    },
    { 
      id: "borrow", 
      label: language === "malayalam" ? "കടം" : "Borrow", 
      icon: Users 
    },
    { 
      id: "income-expense", 
      label: language === "malayalam" ? "ചെലവ്" : "Expense", 
      icon: TrendingUp 
    },
  ];

  const renderContent = () => {
    if (showSettings) {
      return (
        <UserSettings 
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          language={language}
          setLanguage={setLanguage}
          userName={userName}
          setUserName={setUserName}
        />
      );
    }

    switch (activeTab) {
      case "purchases":
        return <ItemPurchase language={language} />;
      case "borrow":
        return <BorrowManagement language={language} />;
      case "income-expense":
        return <IncomeExpense language={language} />;
      default:
        return (
          <div className="p-4 space-y-4 h-full overflow-y-auto">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {language === "malayalam" ? "വരുമാനം" : "Income"}
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        {language === "malayalam" ? "ചെലവ്" : "Expense"}
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        {language === "malayalam" ? "ലാഭം" : "Gain"}
                      </p>
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
                <CardTitle className="text-sm">
                  {language === "malayalam" ? "സമീപകാല ഇടപാടുകൾ" : "Recent Transactions"}
                </CardTitle>
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
                <Button 
                  variant="outline" 
                  className="w-full mt-3 text-sm" 
                  onClick={() => setActiveTab("income-expense")}
                >
                  {language === "malayalam" ? "എല്ലാ ഇടപാടുകളും കാണുക" : "View All Transactions"}
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Header - Fixed */}
      <header className="bg-card shadow-sm border-b px-4 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold">Shop Sahai</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">
            {language === "malayalam" ? `ഹായ്, ${userName}` : `Hi, ${userName}`}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(true)}
            className="p-2"
            aria-label={language === "malayalam" ? "ക്രമീകരണങ്ങൾ" : "Settings"}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full pb-20 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Voice Assistant Button - Floating */}
      <div className="fixed bottom-24 right-4 z-10">
        <Button 
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setShowVoiceAssistant(true)}
          aria-label={language === "malayalam" ? "വോയ്സ് അസിസ്റ്റന്റ്" : "Voice Assistant"}
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg flex-shrink-0">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Voice Assistant Modal */}
      {showVoiceAssistant && (
        <VoiceAssistant
          onClose={() => setShowVoiceAssistant(false)}
          language={language}
        />
      )}
    </div>
  );
};

export default Index;
