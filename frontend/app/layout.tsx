import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "EduSync | School Operating System", description: "One institution. One connected ecosystem." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
