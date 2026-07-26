import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "ProjectHub - Agile Project Management",
    description: "Manage projects, track tasks, and collaborate with your team efficiently.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
                <Toaster position="top-right" />
                {children}
            </body>
        </html>
    );
}
