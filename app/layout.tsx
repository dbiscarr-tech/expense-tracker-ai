import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ExpensesProvider } from "@/context/ExpensesContext";
import { ToastProvider } from "@/context/ToastContext";
import { ExpenseModalProvider } from "@/context/ExpenseModalContext";
import { Nav } from "@/components/Nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ExpenseTracker — Personal Finance Dashboard",
  description: "Track expenses, analyze spending, and stay on top of your budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ExpensesProvider>
          <ToastProvider>
            <ExpenseModalProvider>
              <Nav />
              <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                {children}
              </main>
            </ExpenseModalProvider>
          </ToastProvider>
        </ExpensesProvider>
      </body>
    </html>
  );
}
