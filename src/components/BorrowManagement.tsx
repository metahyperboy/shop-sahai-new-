
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface BorrowManagementProps {
  language: string;
}

interface BorrowItem {
  id: string;
  name: string;
  date: string;
  totalGiven: number;
  amountPaid: number;
  balance: number;
}

const BorrowManagement = ({ language }: BorrowManagementProps) => {
  const [items, setItems] = useState<BorrowItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    totalGiven: "",
    amountPaid: ""
  });

  const isEnglish = language === "english";

  const addItem = () => {
    if (newItem.name && newItem.totalGiven) {
      const totalGiven = parseFloat(newItem.totalGiven) || 0;
      const amountPaid = parseFloat(newItem.amountPaid) || 0;
      const balance = totalGiven - amountPaid;

      const item: BorrowItem = {
        id: `b${items.length + 1}`,
        name: newItem.name,
        date: new Date().toLocaleDateString(),
        totalGiven,
        amountPaid,
        balance
      };

      setItems([...items, item]);
      setNewItem({ name: "", totalGiven: "", amountPaid: "" });
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
            {isEnglish ? "Add New Borrow Record" : "പുതിയ കടം രേഖ ചേർക്കുക"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="borrower-name">
              {isEnglish ? "Borrower Name" : "കടം വാങ്ങുന്നയാളുടെ പേര്"}
            </Label>
            <Input
              id="borrower-name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder={isEnglish ? "Enter borrower name" : "കടം വാങ്ങുന്നയാളുടെ പേര് നൽകുക"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="total-given">
                {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
              </Label>
              <Input
                id="total-given"
                type="number"
                value={newItem.totalGiven}
                onChange={(e) => setNewItem({ ...newItem, totalGiven: e.target.value })}
                placeholder="₹0"
              />
            </div>
            
            <div>
              <Label htmlFor="amount-paid">
                {isEnglish ? "Amount Received" : "തിരികെ കിട്ടിയത്"}
              </Label>
              <Input
                id="amount-paid"
                type="number"
                value={newItem.amountPaid}
                onChange={(e) => setNewItem({ ...newItem, amountPaid: e.target.value })}
                placeholder="₹0"
              />
            </div>
          </div>

          <Button onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? "Add Borrow Record" : "കടം രേഖ ചേർക്കുക"}
          </Button>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEnglish ? "Borrow Records" : "കടം രേഖകൾ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {isEnglish ? "No borrow records yet" : "ഇതുവരെ കടം രേഖകൾ ഇല്ല"}
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{item.name} ({item.id})</p>
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
                        {isEnglish ? "Given" : "നൽകി"}
                      </p>
                      <p className="font-medium">₹{item.totalGiven}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {isEnglish ? "Received" : "കിട്ടി"}
                      </p>
                      <p className="font-medium">₹{item.amountPaid}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {isEnglish ? "Balance" : "ബാക്കി"}
                      </p>
                      <p className={`font-medium ${item.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{item.balance}
                      </p>
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

export default BorrowManagement;
