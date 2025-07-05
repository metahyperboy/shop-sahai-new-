
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { useState } from "react";

interface IncomeExpenseProps {
  language: string;
}

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
}

const IncomeExpense = ({ language }: IncomeExpenseProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "income" as "income" | "expense",
    category: ""
  });

  const isEnglish = language === "english";

  const addTransaction = () => {
    if (newTransaction.amount) {
      const now = new Date();
      const transaction: Transaction = {
        id: `${newTransaction.type === "income" ? "i" : "e"}${transactions.filter(t => t.type === newTransaction.type).length + 1}`,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category || undefined
      };

      setTransactions([transaction, ...transactions]);
      setNewTransaction({ amount: "", type: "income", category: "" });
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isEnglish ? "Total Income" : "മൊത്തം വരുമാനം"}
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
                  {isEnglish ? "Total Expense" : "മൊത്തം ചെലവ്"}
                </p>
                <p className="text-lg font-bold text-red-600">₹{totalExpense}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction */}
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
            <Select value={newTransaction.type} onValueChange={(value: "income" | "expense") => setNewTransaction({ ...newTransaction, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  {isEnglish ? "Income" : "വരുമാനം"}
                </SelectItem>
                <SelectItem value="expense">
                  {isEnglish ? "Expense" : "ചെലവ്"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {isEnglish ? "Category (Optional)" : "വിഭാഗം (ഓപ്ഷണൽ)"}
            </Label>
            <Input
              id="category"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              placeholder={isEnglish ? "e.g., Sales, Travel, Food" : "ഉദാ: വിൽപ്പന, യാത്ര, ഭക്ഷണം"}
            />
          </div>

          <Button onClick={addTransaction} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? "Add Transaction" : "ഇടപാട് ചേർക്കുക"}
          </Button>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEnglish ? "Recent Transactions" : "സമീപകാല ഇടപാടുകൾ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {isEnglish ? "No transactions recorded yet" : "ഇതുവരെ ഇടപാടുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല"}
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === "income" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-medium">
                        {transaction.category || (transaction.type === "income" ? (isEnglish ? "Income" : "വരുമാനം") : (isEnglish ? "Expense" : "ചെലവ്"))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.time} • {transaction.id}
                      </p>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeExpense;
