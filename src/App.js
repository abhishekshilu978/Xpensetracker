import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./App.css";

Modal.setAppElement("#root");

const CATEGORIES = ["Food", "Travel", "Entertainment"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]; 

function App() {
  const [wallet, setWallet] = useState(() => parseFloat(localStorage.getItem("wallet")) || 5000);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem("expenses")) || []);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseForm, setExpenseForm] = useState({ title: "", price: "", category: "", date: "" });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("wallet", wallet);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [wallet, expenses]);

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!incomeAmount) return alert("Enter income amount");
    setWallet((prev) => prev + parseFloat(incomeAmount));
    setIncomeAmount("");
    setIncomeModalOpen(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const { title, price, category, date } = expenseForm;
    if (!title || !price || !category || !date) return alert("Please fill all fields");
    const cost = parseFloat(price);
    if (cost > wallet) return alert("Insufficient balance");
    const newExpenses = [...expenses];
    if (editIndex !== null) {
      const oldCost = newExpenses[editIndex].price;
      newExpenses[editIndex] = { title, price: cost, category, date };
      setWallet((prev) => prev + oldCost - cost);
    } else {
      newExpenses.push({ title, price: cost, category, date });
      setWallet((prev) => prev - cost);
    }
    setExpenses(newExpenses);
    setExpenseForm({ title: "", price: "", category: "", date: "" });
    setEditIndex(null);
    setExpenseModalOpen(false);
  };

  const handleEdit = (index) => {
    const exp = expenses[index];
    setExpenseForm({ ...exp });
    setEditIndex(index);
    setExpenseModalOpen(true);
  };

  const handleDelete = (index) => {
    const exp = expenses[index];
    setWallet((prev) => prev + exp.price);
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const expenseSummary = CATEGORIES.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.price, 0);
    return { name: cat, value: total };
  }).filter((e) => e.value > 0);

  return (
    <div className="app">
      <h1>Expense Tracker</h1>

      <div className="wallet">
        <h2>Wallet Balance: ${wallet.toFixed(2)}</h2>
        <button type="button" onClick={() => setIncomeModalOpen(true)}>
          + Add Income
        </button>
        <button type="button" onClick={() => setExpenseModalOpen(true)}>
          + Add Expense
        </button>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>Expense Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={expenseSummary} dataKey="value" nameKey="name" label>
                {expenseSummary.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h3>Expense Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseSummary}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="expense-list">
         <h2>Expenses</h2>
          <h3>Transactions</h3>
        {expenses.map((exp, index) => (
          <div className="expense-item" key={index}>
            <div>
              <strong>{exp.title}</strong> - ${exp.price} ({exp.category}) on {exp.date}
            </div>
            <div>
              <button onClick={() => handleEdit(index)}><FiEdit /></button>
              <button onClick={() => handleDelete(index)}><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={incomeModalOpen}
        onRequestClose={() => setIncomeModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <form onSubmit={handleAddIncome}>
          <h2>Add Income</h2>
          <input
            type="number"
            placeholder="Income Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
          />
          <button type="submit">Add Balance</button>
        </form>
      </Modal>

      <Modal
        isOpen={expenseModalOpen}
        onRequestClose={() => setExpenseModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <form onSubmit={handleAddExpense}>
          <h2>{editIndex !== null ? "Edit Expense" : "Add Expense"}</h2>
          <input
            name="title"
            value={expenseForm.title}
            onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
            placeholder="Title"
          />
          <input
            name="price"
            type="number"
            value={expenseForm.price}
            onChange={(e) => setExpenseForm({ ...expenseForm, price: e.target.value })}
            placeholder="Amount"
          />
          <select
            name="category"
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <button type="submit">Add Expense</button>
        </form>
      </Modal>
    </div>
  );
}

export default App;
