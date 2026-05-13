import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BayDesk",
  description: "The operating system for your repair shop",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full min-w-0 overflow-x-clip antialiased"
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full min-w-0 flex-col overflow-x-clip bg-zinc-50 text-zinc-900"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
