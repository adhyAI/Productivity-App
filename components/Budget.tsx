import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

type TransactionType = 'income' | 'expense';
type Category = 'salary' | 'freelance' | 'investment' | 'food' | 'transport' | 'utilities' | 'entertainment' | 'healthcare' | 'shopping' | 'other';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
  date: string;
}

export function Budget() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Salary',
      amount: 3500,
      category: 'salary',
      type: 'income',
      date: '2025-02-01'
    },
    {
      id: '2',
      description: 'Groceries',
      amount: 150,
      category: 'food',
      type: 'expense',
      date: '2025-02-01'
    },
    {
      id: '3',
      description: 'Gas Bill',
      amount: 80,
      category: 'utilities',
      type: 'expense',
      date: '2025-02-02'
    },
    {
      id: '4',
      description: 'Freelance Project',
      amount: 800,
      category: 'freelance',
      type: 'income',
      date: '2025-02-02'
    }
  ]);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other' as Category,
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0]
  });

  const categories: { [key in Category]: { label: string; color: string } } = {
    salary: { label: 'Salary', color: 'bg-green-100 text-green-800' },
    freelance: { label: 'Freelance', color: 'bg-blue-100 text-blue-800' },
    investment: { label: 'Investment', color: 'bg-purple-100 text-purple-800' },
    food: { label: 'Food', color: 'bg-orange-100 text-orange-800' },
    transport: { label: 'Transport', color: 'bg-yellow-100 text-yellow-800' },
    utilities: { label: 'Utilities', color: 'bg-red-100 text-red-800' },
    entertainment: { label: 'Entertainment', color: 'bg-pink-100 text-pink-800' },
    healthcare: { label: 'Healthcare', color: 'bg-teal-100 text-teal-800' },
    shopping: { label: 'Shopping', color: 'bg-indigo-100 text-indigo-800' },
    other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
  };

  const addTransaction = () => {
    if (!formData.description.trim() || !formData.amount) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date
    };

    setTransactions(prev => [transaction, ...prev]);
    setFormData({
      description: '',
      amount: '',
      category: 'other',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryTotals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {} as { [key in Category]?: number });

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            {balance >= 0 ? (
              <DollarSign className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(balance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Amount"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
            <Select value={formData.type} onValueChange={(value: TransactionType) => 
              setFormData(prev => ({ ...prev, type: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.category} onValueChange={(value: Category) => 
              setFormData(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <Button onClick={addTransaction} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <div key={category} className="text-center">
                  <Badge className={categories[category as Category].color}>
                    {categories[category as Category].label}
                  </Badge>
                  <div className="mt-2 font-medium">${total?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((total! / totalExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={categories[transaction.category].color}>
                        {categories[transaction.category].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Add your first transaction above to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}