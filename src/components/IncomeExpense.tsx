
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Mic, TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: number;
  type: "Income" | "Expense";
  category?: string;
}

const IncomeExpense = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "i1",
      date: "2025-01-05",
      time: "14:30",
      amount: 700,
      type: "Income",
      category: "Sales",
    },
    {
      id: "e1",
      date: "2025-01-05",
      time: "12:15",
      amount: 200,
      type: "Expense",
      category: "Travel",
    },
    {
      id: "i2",
      date: "2025-01-04",
      time: "16:45",
      amount: 1200,
      type: "Income",
      category: "Sales",
    },
    {
      id: "e2",
      date: "2025-01-04",
      time: "10:30",
      amount: 150,
      type: "Expense",
      category: "Supplies",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "" as "Income" | "Expense" | "",
    category: "",
  });

  const handleAddTransaction = () => {
    if (newTransaction.amount && newTransaction.type) {
      const now = new Date();
      const incomeCount = transactions.filter(t => t.type === "Income").length;
      const expenseCount = transactions.filter(t => t.type === "Expense").length;
      
      const transaction: Transaction = {
        id: newTransaction.type === "Income" ? `i${incomeCount + 1}` : `e${expenseCount + 1}`,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category || "General",
      };

      setTransactions([transaction, ...transactions]);
      setNewTransaction({ amount: "", type: "", category: "" });
      setShowAddForm(false);
    }
  };

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);

  // Calculate weekly totals (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
  const weeklyIncome = weeklyTransactions.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
  const weeklyExpense = weeklyTransactions.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Income & Expense Tracking</h2>
          <p className="text-muted-foreground">Monitor your financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mic className="h-4 w-4 mr-2" />
            Voice Input
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expense</p>
                <p className="text-xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Income</p>
                <p className="text-xl font-bold text-blue-600">₹{weeklyIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Expense</p>
                <p className="text-xl font-bold text-orange-600">₹{weeklyExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={newTransaction.type} onValueChange={(value: "Income" | "Expense") => 
                  setNewTransaction({ ...newTransaction, type: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category (Optional)</label>
                <Input
                  placeholder="e.g., Sales, Travel, Supplies"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddTransaction}>Add Transaction</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.time}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "Income" ? "default" : "destructive"}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className="font-medium">
                    <span className={transaction.type === "Income" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "Income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeExpense;
