
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, TrendingDown, Edit, Check, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateDMY } from "@/lib/utils";

interface IncomeExpenseProps {
  language: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const IncomeExpense = ({ language }: IncomeExpenseProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});

  // Fetch transactions from Supabase
  const fetchTransactions = async (reset = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select('id,type,amount,category,description,created_at')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (filter === 'daily') {
        query = query.gte('created_at', startOfDay.toISOString());
      } else if (filter === 'weekly') {
        query = query.gte('created_at', startOfWeek.toISOString());
      } else if (filter === 'monthly') {
        query = query.gte('created_at', startOfMonth.toISOString());
      }
      const { data, error } = await query;
      if (error) throw error;
      if (reset) {
        setTransactions((data || []).map(item => ({ ...item, type: item.type as "income" | "expense" })));
      } else {
        setTransactions(prev => [...prev, ...(data || []).map(item => ({ ...item, type: item.type as "income" | "expense" }))]);
      }
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTransactions(true);
    const handleDataUpdated = () => {
      setPage(1);
      fetchTransactions(true);
      toast({ title: 'Data Updated', description: 'Transaction data refreshed.', variant: 'default' });
      console.log('[IncomeExpense] Data updated event received, transactions refreshed.');
    };
    window.addEventListener('data-updated', handleDataUpdated);
    return () => {
      window.removeEventListener('data-updated', handleDataUpdated);
    };
  }, [filter]);
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

  const addTransaction = async () => {
    if (newTransaction.amount && newTransaction.category && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            type: newTransaction.type,
            amount: parseFloat(newTransaction.amount),
            category: newTransaction.category,
            description: newTransaction.description || null,
            user_id: (await supabase.auth.getUser()).data.user?.id || ''
          })
          .select()
          .single();

        if (error) throw error;

        setTransactions([{...data, type: data.type as "income" | "expense"}, ...transactions]);
        setNewTransaction({ type: "income", amount: "", category: "", description: "" });
        toast({
          title: "Success",
          description: "Transaction added successfully",
        });
        await fetchTransactions();
        window.dispatchEvent(new CustomEvent('data-updated'));
        console.log('[IncomeExpense] data-updated event fired after DB write.');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add transaction",
          variant: "destructive",
        });
        console.error('[IncomeExpense] Error adding transaction:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      setPage(1);
      await fetchTransactions(true);
      window.dispatchEvent(new CustomEvent('data-updated'));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData({ ...transaction, amount: String(transaction.amount) });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };
  const saveEdit = async (id: string) => {
    if (!editData.amount || !editData.category) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          amount: parseFloat(editData.amount as string),
          category: editData.category,
          description: editData.description || null,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      toast({ title: 'Success', description: 'Transaction updated successfully' });
      setEditingId(null);
      setEditData({});
      setPage(1);
      await fetchTransactions(true);
      window.dispatchEvent(new CustomEvent('data-updated'));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update transaction', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterTransactions = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filter) {
      case 'daily':
        return transactions.filter(t => new Date(t.created_at) >= startOfDay);
      case 'weekly':
        return transactions.filter(t => new Date(t.created_at) >= startOfWeek);
      case 'monthly':
        return transactions.filter(t => new Date(t.created_at) >= startOfMonth);
      default:
        return transactions;
    }
  };

  const filteredTransactions = useMemo(() => transactions, [transactions]);

  const totalIncome = useMemo(() => filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);

  const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);

  const loadMore = () => {
    setPage(p => p + 1);
    fetchTransactions();
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
        <Button
          variant={filter === 'daily' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('daily')}
          className="text-xs sm:text-sm flex-1 min-w-0"
        >
          {isEnglish ? "Daily" : "ദൈനിക"}
        </Button>
        <Button
          variant={filter === 'weekly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('weekly')}
          className="text-xs sm:text-sm flex-1 min-w-0"
        >
          {isEnglish ? "Weekly" : "പ്രതിവാരം"}
        </Button>
        <Button
          variant={filter === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('monthly')}
          className="text-xs sm:text-sm flex-1 min-w-0"
        >
          {isEnglish ? "Monthly" : "പ്രതിമാസം"}
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs sm:text-sm flex-1 min-w-0"
        >
          {isEnglish ? "All" : "എല്ലാം"}
        </Button>
      </div>

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

          <Button onClick={addTransaction} disabled={isSubmitting} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Adding..." : (isEnglish ? "Add Transaction" : "ഇടപാട് ചേർക്കുക")}
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
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {isEnglish ? "No transactions yet" : "ഇതുവരെ ഇടപാടുകൾ ഇല്ല"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${transaction.type === "income" ? "bg-green-500" : "bg-red-500"}`} />
                      <div>
                        {editingId === transaction.id ? (
                          <>
                            <Select value={editData.category as string} onValueChange={v => setEditData(ed => ({ ...ed, category: v }))}>
                              <SelectTrigger><SelectValue placeholder={isEnglish ? "Select category" : "വിഭാഗം തിരഞ്ഞെടുക്കുക"} /></SelectTrigger>
                              <SelectContent>
                                {categories[transaction.type].map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={editData.amount as string}
                              onChange={e => setEditData(ed => ({ ...ed, amount: e.target.value }))}
                              className="mt-1"
                            />
                            <Input
                              value={editData.description as string || ''}
                              onChange={e => setEditData(ed => ({ ...ed, description: e.target.value }))}
                              className="mt-1"
                              placeholder={isEnglish ? "Description (Optional)" : "വിവരണം (ഓപ്ഷണൽ)"}
                            />
                          </>
                        ) : (
                          <>
                            <p className="font-medium">{transaction.category}</p>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{formatDateDMY(transaction.created_at)}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}₹{transaction.amount}
                      </p>
                      {editingId === transaction.id ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => saveEdit(transaction.id)} disabled={isSubmitting} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-gray-600 hover:text-gray-700"><X className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => startEdit(transaction)} className="text-blue-600 hover:text-blue-700"><Edit className="h-4 w-4" /></Button>
                      )}
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
      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <Button onClick={loadMore} size="sm">{isEnglish ? "Load More" : "കൂടുതൽ കാണിക്കുക"}</Button>
        </div>
      )}
    </div>
  );
};

export default IncomeExpense;
