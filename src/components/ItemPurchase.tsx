
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
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

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEnglish ? "Add New Purchase" : "പുതിയ വാങ്ങൽ ചേർക്കുക"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
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

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEnglish ? "Purchase Records" : "വാങ്ങൽ രേഖകൾ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {isEnglish ? "No purchases recorded yet" : "ഇതുവരെ വാങ്ങലുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല"}
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{item.name} ({item.id})</p>
                      <p className="text-sm text-muted-foreground">{item.product}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        {isEnglish ? "Total" : "മൊത്തം"}
                      </p>
                      <p className="font-medium">₹{item.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {isEnglish ? "Given" : "നൽകി"}
                      </p>
                      <p className="font-medium">₹{item.amountGiven}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {isEnglish ? "Balance" : "ബാക്കി"}
                      </p>
                      <p className="font-medium text-red-600">₹{item.balance}</p>
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

export default ItemPurchase;
