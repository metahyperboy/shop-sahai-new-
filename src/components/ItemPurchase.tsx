
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

interface ItemPurchaseProps {
  language: string;
}

interface PurchaseItem {
  id: string;
  name: string;
  date: string;
  product: string;
  totalAmount: number;
  amountGiven: number;
  balance: number;
}

const ItemPurchase = ({ language }: ItemPurchaseProps) => {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    product: "",
    totalAmount: "",
    amountGiven: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{
    name: string;
    product: string;
    totalAmount: string;
    amountGiven: string;
  }>({
    name: "",
    product: "",
    totalAmount: "",
    amountGiven: ""
  });

  const isEnglish = language === "english";

  const addItem = () => {
    if (newItem.name && newItem.product && newItem.totalAmount) {
      const totalAmount = parseFloat(newItem.totalAmount) || 0;
      const amountGiven = parseFloat(newItem.amountGiven) || 0;
      const balance = totalAmount - amountGiven;

      const item: PurchaseItem = {
        id: `s${items.length + 1}`,
        name: newItem.name,
        date: new Date().toLocaleDateString(),
        product: newItem.product,
        totalAmount,
        amountGiven,
        balance
      };

      setItems([...items, item]);
      setNewItem({ name: "", product: "", totalAmount: "", amountGiven: "" });
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const startEdit = (item: PurchaseItem) => {
    setEditingId(item.id);
    setEditItem({
      name: item.name,
      product: item.product,
      totalAmount: item.totalAmount.toString(),
      amountGiven: item.amountGiven.toString()
    });
  };

  const saveEdit = () => {
    if (editingId && editItem.name && editItem.product && editItem.totalAmount) {
      const totalAmount = parseFloat(editItem.totalAmount) || 0;
      const amountGiven = parseFloat(editItem.amountGiven) || 0;
      const balance = totalAmount - amountGiven;

      setItems(items.map(item => 
        item.id === editingId 
          ? { ...item, name: editItem.name, product: editItem.product, totalAmount, amountGiven, balance }
          : item
      ));
      setEditingId(null);
      setEditItem({ name: "", product: "", totalAmount: "", amountGiven: "" });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem({ name: "", product: "", totalAmount: "", amountGiven: "" });
  };

  const totalSuppliers = items.length;
  const totalOutstanding = items.reduce((sum, item) => sum + item.balance, 0);
  const totalPurchases = items.reduce((sum, item) => sum + item.totalAmount, 0);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalSuppliers}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Suppliers" : "മൊത്തം വിതരണക്കാർ"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">₹{totalOutstanding.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Outstanding" : "മൊത്തം ബാക്കി"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">₹{totalPurchases.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
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
                        {isEnglish ? "Number" : "നമ്പർ"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Supplier Name" : "വിതരണക്കാരന്റെ പേര്"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Date" : "തീയതി"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Product" : "ഉൽപ്പന്നം"}
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
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium">{item.id}</td>
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              value={editItem.name}
                              onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{item.date}</td>
                        <td className="p-3 text-sm">
                          {editingId === item.id ? (
                            <Input
                              value={editItem.product}
                              onChange={(e) => setEditItem({...editItem, product: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            item.product
                          )}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              type="number"
                              value={editItem.totalAmount}
                              onChange={(e) => setEditItem({...editItem, totalAmount: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            `₹${item.totalAmount.toLocaleString()}`
                          )}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              type="number"
                              value={editItem.amountGiven}
                              onChange={(e) => setEditItem({...editItem, amountGiven: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            `₹${item.amountGiven.toLocaleString()}`
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplier-name" className="text-sm font-medium">
                  {isEnglish ? "Supplier Name" : "വിതരണക്കാരന്റെ പേര്"}
                </Label>
                <Input
                  id="supplier-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder={isEnglish ? "Enter supplier name" : "വിതരണക്കാരന്റെ പേര് നൽകുക"}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-sm font-medium">
                  {isEnglish ? "Product Name" : "ഉൽപ്പന്നത്തിന്റെ പേര്"}
                </Label>
                <Input
                  id="product-name"
                  value={newItem.product}
                  onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                  placeholder={isEnglish ? "Enter product name" : "ഉൽപ്പന്നത്തിന്റെ പേര് നൽകുക"}
                  className="h-11"
                />
              </div>
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
                  value={newItem.amountGiven}
                  onChange={(e) => setNewItem({ ...newItem, amountGiven: e.target.value })}
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
