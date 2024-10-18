// import Clerk components and providers
import { ClerkProvider, SignInButton, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import './globals.css';
import { Inter } from 'next/font/google';

// Define your font
const inter = Inter({ subsets: ['latin'] });

// Set metadata
export const metadata = {
    title: 'Gamer Gunz',
    description: 'Level up your fitness game with Gamer Gunz',
};

// RootLayout component with Clerk protection
export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                {children}
            </SignedIn>
            </body>
            </html>
        </ClerkProvider>
    );
}
