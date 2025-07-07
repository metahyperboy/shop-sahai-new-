
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{
    name: string;
    totalGiven: string;
    amountPaid: string;
  }>({
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

  const startEdit = (item: BorrowItem) => {
    setEditingId(item.id);
    setEditItem({
      name: item.name,
      totalGiven: item.totalGiven.toString(),
      amountPaid: item.amountPaid.toString()
    });
  };

  const saveEdit = () => {
    if (editingId && editItem.name && editItem.totalGiven) {
      const totalGiven = parseFloat(editItem.totalGiven) || 0;
      const amountPaid = parseFloat(editItem.amountPaid) || 0;
      const balance = totalGiven - amountPaid;

      setItems(items.map(item => 
        item.id === editingId 
          ? { ...item, name: editItem.name, totalGiven, amountPaid, balance }
          : item
      ));
      setEditingId(null);
      setEditItem({ name: "", totalGiven: "", amountPaid: "" });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem({ name: "", totalGiven: "", amountPaid: "" });
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
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-600 mb-1">{totalBorrowers}</div>
              <div className="text-xs text-muted-foreground">
                {isEnglish ? "Total Borrowers" : "മൊത്തം കടക്കാർ"}
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
              <div className="text-xl font-bold text-green-600 mb-1">₹{totalGiven.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
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
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Number" : "നമ്പർ"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Borrower Name" : "കടക്കാരന്റെ പേര്"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Date" : "തീയതി"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Amount Given" : "നൽകിയ തുക"}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {isEnglish ? "Amount Received" : "തിരികെ കിട്ടിയത്"}
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
                        <td className="p-3 text-sm font-medium">
                          {editingId === item.id ? (
                            <Input
                              type="number"
                              value={editItem.totalGiven}
                              onChange={(e) => setEditItem({...editItem, totalGiven: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            `₹${item.totalGiven.toLocaleString()}`
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
                            `₹${item.amountPaid.toLocaleString()}`
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
