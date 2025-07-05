
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Mic } from "lucide-react";

interface Purchase {
  id: string;
  name: string;
  date: string;
  productName: string;
  totalAmount: number;
  amountGiven: number;
  balance: number;
}

const ItemPurchase = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: "s1",
      name: "Rahul",
      date: "2025-01-05",
      productName: "Banana",
      totalAmount: 1000,
      amountGiven: 200,
      balance: 800,
    },
    {
      id: "s2",
      name: "Priya",
      date: "2025-01-04",
      productName: "Rice",
      totalAmount: 2500,
      amountGiven: 2500,
      balance: 0,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    name: "",
    productName: "",
    totalAmount: "",
    amountGiven: "",
  });

  const handleAddPurchase = () => {
    if (newPurchase.name && newPurchase.productName && newPurchase.totalAmount) {
      const total = parseFloat(newPurchase.totalAmount);
      const given = parseFloat(newPurchase.amountGiven) || 0;
      const balance = total - given;

      const purchase: Purchase = {
        id: `s${purchases.length + 1}`,
        name: newPurchase.name,
        date: new Date().toISOString().split('T')[0],
        productName: newPurchase.productName,
        totalAmount: total,
        amountGiven: given,
        balance: balance,
      };

      setPurchases([...purchases, purchase]);
      setNewPurchase({ name: "", productName: "", totalAmount: "", amountGiven: "" });
      setShowAddForm(false);
    }
  };

  const updateBalance = (id: string, additionalPayment: number) => {
    setPurchases(purchases.map(purchase => {
      if (purchase.id === id) {
        const newAmountGiven = purchase.amountGiven + additionalPayment;
        const newBalance = purchase.totalAmount - newAmountGiven;
        return {
          ...purchase,
          amountGiven: newAmountGiven,
          balance: Math.max(0, newBalance),
        };
      }
      return purchase;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Item Purchase Management</h2>
          <p className="text-muted-foreground">Track supplier purchases and balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mic className="h-4 w-4 mr-2" />
            Voice Input
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{purchases.length}</p>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ₹{purchases.reduce((sum, p) => sum + p.balance, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₹{purchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Purchase Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Supplier Name</label>
                <Input
                  placeholder="Enter supplier name"
                  value={newPurchase.name}
                  onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  placeholder="Enter product name"
                  value={newPurchase.productName}
                  onChange={(e) => setNewPurchase({ ...newPurchase, productName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPurchase.totalAmount}
                  onChange={(e) => setNewPurchase({ ...newPurchase, totalAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount Given (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPurchase.amountGiven}
                  onChange={(e) => setNewPurchase({ ...newPurchase, amountGiven: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddPurchase}>Add Purchase</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Amount Given</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{purchase.name}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{purchase.productName}</TableCell>
                  <TableCell>₹{purchase.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>₹{purchase.amountGiven.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">
                    <span className={purchase.balance > 0 ? "text-red-600" : "text-green-600"}>
                      ₹{purchase.balance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={purchase.balance > 0 ? "destructive" : "default"}>
                      {purchase.balance > 0 ? "Pending" : "Cleared"}
                    </Badge>
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

export default ItemPurchase;
