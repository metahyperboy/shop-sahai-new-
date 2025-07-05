
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Mic } from "lucide-react";

interface Borrow {
  id: string;
  name: string;
  date: string;
  totalAmountGiven: number;
  amountPaidBack: number;
  balanceAmount: number;
}

const BorrowManagement = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([
    {
      id: "b1",
      name: "Arjun",
      date: "2025-01-05",
      totalAmountGiven: 500,
      amountPaidBack: 200,
      balanceAmount: 300,
    },
    {
      id: "b2",
      name: "Meera",
      date: "2025-01-03",
      totalAmountGiven: 1000,
      amountPaidBack: 1000,
      balanceAmount: 0,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBorrow, setNewBorrow] = useState({
    name: "",
    totalAmountGiven: "",
    amountPaidBack: "",
  });

  const handleAddBorrow = () => {
    if (newBorrow.name && newBorrow.totalAmountGiven) {
      const totalGiven = parseFloat(newBorrow.totalAmountGiven);
      const paidBack = parseFloat(newBorrow.amountPaidBack) || 0;
      const balance = totalGiven - paidBack;

      const borrow: Borrow = {
        id: `b${borrows.length + 1}`,
        name: newBorrow.name,
        date: new Date().toISOString().split('T')[0],
        totalAmountGiven: totalGiven,
        amountPaidBack: paidBack,
        balanceAmount: balance,
      };

      setBorrows([...borrows, borrow]);
      setNewBorrow({ name: "", totalAmountGiven: "", amountPaidBack: "" });
      setShowAddForm(false);
    }
  };

  const updatePayment = (id: string, additionalPayment: number) => {
    setBorrows(borrows.map(borrow => {
      if (borrow.id === id) {
        const newAmountPaidBack = borrow.amountPaidBack + additionalPayment;
        const newBalance = borrow.totalAmountGiven - newAmountPaidBack;
        return {
          ...borrow,
          amountPaidBack: newAmountPaidBack,
          balanceAmount: Math.max(0, newBalance),
        };
      }
      return borrow;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Borrow Management</h2>
          <p className="text-muted-foreground">Track loans given to customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mic className="h-4 w-4 mr-2" />
            Voice Input
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Borrow Entry
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{borrows.length}</p>
              <p className="text-sm text-muted-foreground">Total Borrowers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                ₹{borrows.reduce((sum, b) => sum + b.balanceAmount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Outstanding Amount</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₹{borrows.reduce((sum, b) => sum + b.totalAmountGiven, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Lent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Borrow Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Borrow Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Borrower Name</label>
                <Input
                  placeholder="Enter borrower name"
                  value={newBorrow.name}
                  onChange={(e) => setNewBorrow({ ...newBorrow, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount Given (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newBorrow.totalAmountGiven}
                  onChange={(e) => setNewBorrow({ ...newBorrow, totalAmountGiven: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount Paid Back (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newBorrow.amountPaidBack}
                  onChange={(e) => setNewBorrow({ ...newBorrow, amountPaidBack: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddBorrow}>Add Entry</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Borrow Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Borrow Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Borrower Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount Given</TableHead>
                <TableHead>Amount Paid Back</TableHead>
                <TableHead>Balance Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrows.map((borrow) => (
                <TableRow key={borrow.id}>
                  <TableCell className="font-medium">{borrow.id}</TableCell>
                  <TableCell>{borrow.name}</TableCell>
                  <TableCell>{borrow.date}</TableCell>
                  <TableCell>₹{borrow.totalAmountGiven.toLocaleString()}</TableCell>
                  <TableCell>₹{borrow.amountPaidBack.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">
                    <span className={borrow.balanceAmount > 0 ? "text-red-600" : "text-green-600"}>
                      ₹{borrow.balanceAmount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={borrow.balanceAmount > 0 ? "destructive" : "default"}>
                      {borrow.balanceAmount > 0 ? "Outstanding" : "Cleared"}
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

export default BorrowManagement;
