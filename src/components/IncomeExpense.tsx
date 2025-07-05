
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface IncomeExpenseProps {
  language: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

const IncomeExpense = ({ language }: IncomeExpenseProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    type: "income",
    amount: "",
    category: "",
    description: ""
  });

  const isEnglish = language === "english";

  const categories = {
    income: isEnglish 
      ? ["Sales", "Service", "Investment", "Other"] 
      : ["വിൽപന", "സേവനം", "നിക്ഷേപം", "മറ്റുള്ളവ"],
    expense: isEnglish 
      ? ["Travel", "Food", "Utilities", "Supplies", "Other"] 
      : ["യാത്ര", "ഭക്ഷണം", "യൂട്ടിലിറ്റി", "സാധനങ്ങൾ", "മറ്റുള്ളവ"]
  };

  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category) {
      const transaction: Transaction = {
        id: `t${transactions.length + 1}`,
        type: newTransaction.type as "income" | "expense",
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        description: newTransaction.description,
        date: new Date().toLocaleDateString()
      };

      setTransactions([...transactions, transaction]);
      setNewTransaction({ type: "income", amount: "", category: "", description: "" });
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isEnglish ? "Income" : "വരുമാനം"}
                </p>
                <p className="text-lg font-bold text-green-600">₹{totalIncome}</p>
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
                  {isEnglish ? "Expense" : "ചെലവ്"}
                </p>
                <p className="text-lg font-bold text-red-600">₹{totalExpense}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEnglish ? "Add Transaction" : "ഇടപാട് ചേർക്കുക"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="transaction-type">
              {isEnglish ? "Type" : "തരം"}
            </Label>
            <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value, category: "" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{isEnglish ? "Income" : "വരുമാനം"}</SelectItem>
                <SelectItem value="expense">{isEnglish ? "Expense" : "ചെലവ്"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">
                {isEnglish ? "Amount" : "തുക"}
              </Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="₹0"
              />
            </div>
            
            <div>
              <Label htmlFor="category">
                {isEnglish ? "Category" : "വിഭാഗം"}
              </Label>
              <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={isEnglish ? "Select category" : "വിഭാഗം തിരഞ്ഞെടുക്കുക"} />
                </SelectTrigger>
                <SelectContent>
                  {categories[newTransaction.type as keyof typeof categories].map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              {isEnglish ? "Description (Optional)" : "വിവരണം (ഓപ്ഷണൽ)"}
            </Label>
            <Input
              id="description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              placeholder={isEnglish ? "Enter description" : "വിവരണം നൽകുക"}
            />
          </div>

          <Button onClick={addTransaction} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? "Add Transaction" : "ഇടപാട് ചേർക്കുക"}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEnglish ? "Recent Transactions" : "സമീപകാല ഇടപാടുകൾ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {isEnglish ? "No transactions yet" : "ഇതുവരെ ഇടപാടുകൾ ഇല്ല"}
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-bold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}₹{transaction.amount}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeExpense;
