import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "OmniSync",
    description: "Manage projects, track tasks, and collaborate with your team efficiently.",
    icons: {
        icon: [
            { url: "/favicon.png", sizes: "any" },
            { url: "/favicon.png", type: "image/png" },
        ],
        shortcut: ["/favicon.png"],
        apple: [
            { url: "/favicon.png" },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
                <link rel="apple-touch-icon" href="/favicon.png" />
            </head>
            <body className={`${plusJakartaSans.variable} font-sans bg-[#F8FAFC] text-[#1b1b24] antialiased`}>
                <Toaster position="top-center" />
                {children}
            </body>
        </html>
    );
}
