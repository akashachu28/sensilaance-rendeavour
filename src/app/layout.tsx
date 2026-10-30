import type { Metadata } from "next";
import { IBM_Plex_Sans, Geist } from "next/font/google";
import "./globals.css"; // must contain the Tailwind directives / @import "tailwindcss"
import Sidebar, { SidebarProvider } from "./components/Sidebar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Sensilance | Overview",
  description: "Site-wide PPE compliance and safety monitoring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${plex.className} bg-[#F2F4F7] text-[#16212B] antialiased`}>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}