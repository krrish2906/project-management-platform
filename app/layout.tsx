import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    variable: "--font-poppins",
});

export const metadata: Metadata = {
    title: "ProjectHub | Project Management",
    description: "A project management app",
};

export default function RootLayout({ children, } : Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${poppins.variable} antialiased`}>
                <Toaster position="top-center" reverseOrder={false} />
                {children}
            </body>
        </html>
    );
}
