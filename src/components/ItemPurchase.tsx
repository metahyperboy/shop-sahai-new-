
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Mic, Edit, Trash2 } from "lucide-react";
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

  const totalSuppliers = items.length;
  const totalOutstanding = items.reduce((sum, item) => sum + item.balance, 0);
  const totalPurchases = items.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">
              {isEnglish ? "Item Purchase Management" : "സാധന വാങ്ങൽ മാനേജ്മെന്റ്"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEnglish ? "Track supplier purchases and balances" : "വിതരണക്കാരുടെ വാങ്ങലുകളും ബാക്കിയും ട്രാക്ക് ചെയ്യുക"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Mic className="h-4 w-4 mr-1" />
              {isEnglish ? "Voice Input" : "വോയ്സ് ഇൻപുട്ട്"}
            </Button>
            <Button size="sm" onClick={() => document.getElementById('add-form')?.scrollIntoView()}>
              <Plus className="h-4 w-4 mr-1" />
              {isEnglish ? "Add Purchase" : "വാങ്ങൽ ചേർക്കുക"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSuppliers}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Suppliers" : "മൊത്തം വിതരണക്കാർ"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">₹{totalOutstanding.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Outstanding" : "മൊത്തം ബാക്കി"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">₹{totalPurchases.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Purchases" : "മൊത്തം വാങ്ങലുകൾ"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Records Table */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEnglish ? "Purchase Records" : "വാങ്ങൽ രേഖകൾ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isEnglish ? "No purchases recorded yet" : "ഇതുവരെ വാങ്ങലുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Number" : "നമ്പർ"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Supplier Name" : "വിതരണക്കാരന്റെ പേര്"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Date" : "തീയതി"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Product" : "ഉൽപ്പന്നം"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Total Amount" : "മൊത്തം തുക"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Balance" : "ബാക്കി"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Status" : "സ്ഥിതി"}
                      </th>
                      <th className="text-left p-2 font-medium">
                        {isEnglish ? "Actions" : "പ്രവർത്തനങ്ങൾ"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{item.id}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-sm text-muted-foreground">{item.date}</td>
                        <td className="p-2">{item.product}</td>
                        <td className="p-2">₹{item.totalAmount.toLocaleString()}</td>
                        <td className="p-2">₹{item.amountGiven.toLocaleString()}</td>
                        <td className="p-2">
                          <span className={item.balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                            ₹{item.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
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
                        <td className="p-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
        <Card className="mt-4" id="add-form">
          <CardHeader>
            <CardTitle className="text-lg">
              {isEnglish ? "Add New Purchase" : "പുതിയ വാങ്ങൽ ചേർക്കുക"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier-name">
                  {isEnglish ? "Supplier Name" : "വിതരണക്കാരന്റെ പേര്"}
                </Label>
                <Input
                  id="supplier-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder={isEnglish ? "Enter supplier name" : "വിതരണക്കാരന്റെ പേര് നൽകുക"}
                />
              </div>
              
              <div>
                <Label htmlFor="product-name">
                  {isEnglish ? "Product Name" : "ഉൽപ്പന്നത്തിന്റെ പേര്"}
                </Label>
                <Input
                  id="product-name"
                  value={newItem.product}
                  onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                  placeholder={isEnglish ? "Enter product name" : "ഉൽപ്പന്നത്തിന്റെ പേര് നൽകുക"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total-amount">
                  {isEnglish ? "Total Amount" : "മൊത്തം തുക"}
                </Label>
                <Input
                  id="total-amount"
                  type="number"
                  value={newItem.totalAmount}
                  onChange={(e) => setNewItem({ ...newItem, totalAmount: e.target.value })}
                  placeholder="₹0"
                />
              </div>
              
              <div>
                <Label htmlFor="amount-given">
                  {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                </Label>
                <Input
                  id="amount-given"
                  type="number"
                  value={newItem.amountGiven}
                  onChange={(e) => setNewItem({ ...newItem, amountGiven: e.target.value })}
                  placeholder="₹0"
                />
              </div>
            </div>

            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {isEnglish ? "Add Purchase" : "വാങ്ങൽ ചേർക്കുക"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemPurchase;
