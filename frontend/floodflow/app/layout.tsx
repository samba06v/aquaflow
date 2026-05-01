import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaFlow - Priority-Based Flood Routing",
  description:
    "Smart navigation during urban flooding. Priority routing prevents the herd effect and gets emergency vehicles, commuters and citizens safely to their destination.",
  keywords: ["flood routing", "disaster management", "smart navigation", "priority routing", "urban flooding"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
