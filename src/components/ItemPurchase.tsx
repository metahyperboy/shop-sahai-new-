import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ItemPurchaseProps {
  language: string;
}

interface PurchaseItem {
  id: string;
  supplier_name: string;
  created_at: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
}

const ItemPurchase = ({ language }: ItemPurchaseProps) => {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [newItem, setNewItem] = useState({
    supplierName: "",
    totalAmount: "",
    amountPaid: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{
    supplierName: string;
    totalAmount: string;
    amountPaid: string;
  }>({
    supplierName: "",
    totalAmount: "",
    amountPaid: ""
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isEnglish = language === "english";

  // Fetch purchases from Supabase
  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const addItem = async () => {
    if (newItem.supplierName && newItem.totalAmount) {
      const totalAmount = parseFloat(newItem.totalAmount) || 0;
      const amountPaid = parseFloat(newItem.amountPaid) || 0;
      const balance = totalAmount - amountPaid;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('purchases')
          .insert({
            user_id: user.id,
            supplier_name: newItem.supplierName,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            balance
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Purchase added successfully",
        });

        setNewItem({ supplierName: "", totalAmount: "", amountPaid: "" });
        fetchPurchases();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add purchase",
          variant: "destructive",
        });
      }
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });

      fetchPurchases();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive",
      });
    }
  };

  const startEdit = (item: PurchaseItem) => {
    setEditingId(item.id);
    setEditItem({
      supplierName: item.supplier_name,
      totalAmount: item.total_amount.toString(),
      amountPaid: item.amount_paid.toString()
    });
  };

  const saveEdit = async () => {
    if (editingId && editItem.supplierName && editItem.totalAmount) {
      const totalAmount = parseFloat(editItem.totalAmount) || 0;
      const amountPaid = parseFloat(editItem.amountPaid) || 0;
      const balance = totalAmount - amountPaid;

      try {
        const { error } = await supabase
          .from('purchases')
          .update({
            supplier_name: editItem.supplierName,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            balance
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Purchase updated successfully",
        });

        setEditingId(null);
        setEditItem({ supplierName: "", totalAmount: "", amountPaid: "" });
        fetchPurchases();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update purchase",
          variant: "destructive",
        });
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem({ supplierName: "", totalAmount: "", amountPaid: "" });
  };

  const totalSuppliers = items.length;
  const totalOutstanding = items.reduce((sum, item) => sum + item.balance, 0);
  const totalPurchases = items.reduce((sum, item) => sum + item.total_amount, 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b bg-card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isEnglish ? "Item Purchase Management" : "സാധന വാങ്ങൽ മാനേജ്മെന്റ്"}
          </h1>
          <Button size="sm" onClick={() => document.getElementById('add-form')?.scrollIntoView()}>
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? "Add Purchase" : "വാങ്ങൽ ചേർക്കുക"}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-600 mb-1">{totalSuppliers}</div>
              <div className="text-xs text-muted-foreground">
                {isEnglish ? "Total Suppliers" : "മൊത്തം വിതരണക്കാർ"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-red-600 mb-1">₹{totalOutstanding.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {isEnglish ? "Total Outstanding" : "മൊത്തം ബാക്കി"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600 mb-1">₹{totalPurchases.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {isEnglish ? "Total Purchases" : "മൊത്തം വാങ്ങലുകൾ"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Records Table */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {isEnglish ? "Purchase Records" : "വാങ്ങൽ രേഖകൾ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {isEnglish ? "No purchases recorded yet" : "ഇതുവരെ വാങ്ങലുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല"}
                </p>
              </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Supplier Name" : "വിതരണക്കാരന്റെ പേര്"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Date" : "തീയതി"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Total Amount" : "മൊത്തം തുക"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Balance" : "ബാക്കി"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Status" : "സ്ഥിതി"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Actions" : "പ്രവർത്തനങ്ങൾ"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              value={editItem.supplierName}
                              onChange={(e) => setEditItem({...editItem, supplierName: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            item.supplier_name
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              type="number"
                              value={editItem.totalAmount}
                              onChange={(e) => setEditItem({...editItem, totalAmount: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            `₹${item.total_amount.toLocaleString()}`
                          )}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              type="number"
                              value={editItem.amountPaid}
                              onChange={(e) => setEditItem({...editItem, amountPaid: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            `₹${item.amount_paid.toLocaleString()}`
                          )}
                        </td>
                        <td className="p-3 text-sm font-semibold">
                          <span className={item.balance > 0 ? "text-red-600" : "text-green-600"}>
                            ₹{item.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.balance > 0 
                              ? "bg-red-100 text-red-700" 
                              : "bg-green-100 text-green-700"
                          }`}>
                            {item.balance > 0 
                              ? (isEnglish ? "Pending" : "ബാക്കി") 
                              : (isEnglish ? "Cleared" : "തീർത്തു")
                            }
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {editingId === item.id ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={saveEdit}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={cancelEdit}
                                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => startEdit(item)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteItem(item.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Purchase Form */}
        <Card id="add-form">
          <CardHeader>
            <CardTitle className="text-xl">
              {isEnglish ? "Add New Purchase" : "പുതിയ വാങ്ങൽ ചേർക്കുക"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="supplier-name" className="text-sm font-medium">
                {isEnglish ? "Supplier Name" : "വിതരണക്കാരന്റെ പേര്"}
              </Label>
              <Input
                id="supplier-name"
                value={newItem.supplierName}
                onChange={(e) => setNewItem({ ...newItem, supplierName: e.target.value })}
                placeholder={isEnglish ? "Enter supplier name" : "വിതരണക്കാരന്റെ പേര് നൽകുക"}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="total-amount" className="text-sm font-medium">
                  {isEnglish ? "Total Amount" : "മൊത്തം തുക"}
                </Label>
                <Input
                  id="total-amount"
                  type="number"
                  value={newItem.totalAmount}
                  onChange={(e) => setNewItem({ ...newItem, totalAmount: e.target.value })}
                  placeholder="₹0"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount-given" className="text-sm font-medium">
                  {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                </Label>
                <Input
                  id="amount-given"
                  type="number"
                  value={newItem.amountPaid}
                  onChange={(e) => setNewItem({ ...newItem, amountPaid: e.target.value })}
                  placeholder="₹0"
                  className="h-11"
                />
              </div>
            </div>

            <Button onClick={addItem} className="w-full h-11 text-base">
              <Plus className="h-5 w-5 mr-2" />
              {isEnglish ? "Add Purchase" : "വാങ്ങൽ ചേർക്കുക"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemPurchase;