import type { Expense } from "./types";

const SAMPLE: Array<Omit<Expense, "id" | "createdAt">> = [
  { date: daysAgo(1), amount: 42.5, category: "Food", description: "Groceries at Trader Joe's" },
  { date: daysAgo(2), amount: 15.0, category: "Transportation", description: "Uber to downtown" },
  { date: daysAgo(3), amount: 89.99, category: "Shopping", description: "New running shoes" },
  { date: daysAgo(4), amount: 12.5, category: "Food", description: "Coffee and pastry" },
  { date: daysAgo(5), amount: 60.0, category: "Entertainment", description: "Concert tickets" },
  { date: daysAgo(7), amount: 120.0, category: "Bills", description: "Internet bill" },
  { date: daysAgo(9), amount: 34.2, category: "Food", description: "Dinner with friends" },
  { date: daysAgo(11), amount: 8.75, category: "Transportation", description: "Bus pass top-up" },
  { date: daysAgo(13), amount: 55.0, category: "Shopping", description: "Books" },
  { date: daysAgo(15), amount: 200.0, category: "Bills", description: "Electricity bill" },
  { date: daysAgo(18), amount: 27.3, category: "Entertainment", description: "Movie night" },
  { date: daysAgo(21), amount: 16.4, category: "Food", description: "Lunch takeout" },
  { date: daysAgo(25), amount: 45.0, category: "Other", description: "Gift for friend" },
  { date: daysAgo(30), amount: 95.0, category: "Shopping", description: "Winter jacket" },
  { date: daysAgo(35), amount: 22.0, category: "Transportation", description: "Gas fill-up" },
  { date: daysAgo(40), amount: 130.0, category: "Bills", description: "Phone plan" },
  { date: daysAgo(45), amount: 18.6, category: "Food", description: "Groceries" },
  { date: daysAgo(50), amount: 70.0, category: "Entertainment", description: "Streaming subscriptions" },
  { date: daysAgo(58), amount: 33.0, category: "Other", description: "Donation" },
  { date: daysAgo(65), amount: 25.5, category: "Transportation", description: "Parking" },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function generateSampleExpenses(): Expense[] {
  const now = new Date().toISOString();
  return SAMPLE.map((item, index) => ({
    ...item,
    id: `sample-${index}-${Date.now()}`,
    createdAt: now,
  }));
}
