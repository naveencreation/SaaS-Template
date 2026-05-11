import type { Metadata } from "next";
import { cssVariables } from "@/config/theme.config";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Template",
  description: "A production-grade SaaS starter template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Convert the JavaScript object into a valid CSS string
  const cssString = Object.entries(cssVariables)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root {\n${cssString}\n}` }} />
      </head>
      <body className="min-h-screen bg-surface-background antialiased">{children}</body>
    </html>
  );
}
