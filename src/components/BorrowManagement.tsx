
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

  const totalBorrowers = items.length;
  const totalOutstanding = items.reduce((sum, item) => sum + item.balance, 0);
  const totalGiven = items.reduce((sum, item) => sum + item.totalGiven, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b bg-card">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isEnglish ? "Borrow Management" : "കടം മാനേജ്മെന്റ്"}
          </h1>
          <Button size="sm" onClick={() => document.getElementById('add-form')?.scrollIntoView()}>
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? "Add Record" : "രേഖ ചേർക്കുക"}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalBorrowers}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Borrowers" : "മൊത്തം കടക്കാർ"}
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
              <div className="text-3xl font-bold text-green-600 mb-2">₹{totalGiven.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {isEnglish ? "Total Given" : "മൊത്തം നൽകിയത്"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Borrow Records Table */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {isEnglish ? "Borrow Records" : "കടം രേഖകൾ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {isEnglish ? "No borrow records yet" : "ഇതുവരെ കടം രേഖകൾ ഇല്ല"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Number" : "നമ്പർ"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Borrower Name" : "കടക്കാരന്റെ പേര്"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Date" : "തീയതി"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Amount Received" : "തിരികെ കിട്ടിയത്"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Balance" : "ബാക്കി"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Status" : "സ്ഥിതി"}
                      </th>
                      <th className="text-left p-3 font-medium">
                        {isEnglish ? "Actions" : "പ്രവർത്തനങ്ങൾ"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{item.id}</td>
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-sm text-muted-foreground">{item.date}</td>
                        <td className="p-3 font-medium">₹{item.totalGiven.toLocaleString()}</td>
                        <td className="p-3 font-medium">₹{item.amountPaid.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={item.balance > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                            ₹{item.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Add Borrow Form */}
        <Card id="add-form">
          <CardHeader>
            <CardTitle className="text-xl">
              {isEnglish ? "Add New Borrow Record" : "പുതിയ കടം രേഖ ചേർക്കുക"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="borrower-name" className="text-sm font-medium">
                {isEnglish ? "Borrower Name" : "കടക്കാരന്റെ പേര്"}
              </Label>
              <Input
                id="borrower-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder={isEnglish ? "Enter borrower name" : "കടക്കാരന്റെ പേര് നൽകുക"}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="total-given" className="text-sm font-medium">
                  {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                </Label>
                <Input
                  id="total-given"
                  type="number"
                  value={newItem.totalGiven}
                  onChange={(e) => setNewItem({ ...newItem, totalGiven: e.target.value })}
                  placeholder="₹0"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount-paid" className="text-sm font-medium">
                  {isEnglish ? "Amount Received" : "തിരികെ കിട്ടിയത്"}
                </Label>
                <Input
                  id="amount-paid"
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
              {isEnglish ? "Add Borrow Record" : "കടം രേഖ ചേർക്കുക"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BorrowManagement;
