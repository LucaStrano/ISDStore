import "./globals.css";
import { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "ISDStore",
  description: "E-commerce for computer hardware",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto p-4">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
