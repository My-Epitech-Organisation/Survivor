"use client";

import Link from 'next/link';
import { Geist, Geist_Mono, Bowlby_One } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bowlbyOne = Bowlby_One({
  variable: "--font-bowlby-one",
  subsets: ["latin"],
  weight: "400",
});

export default function Custom404() {
  return (
    <div className="h-screen flex flex-col w-full">
      <Navigation/>
      <div className={`flex-1 bg-gradient-to-br from-app-gradient-from to-app-gradient-to text-app-white flex items-center justify-center px-4 ${geistSans.variable} ${geistMono.variable} ${bowlbyOne.variable}`}>
        <div className="text-center">
          <h1 className={`text-[120px] md:text-[180px] font-bold text-app-blue-primary mb-1 ${bowlbyOne.className}`}>
            404
          </h1>
          <p className={`text-xl ${geistMono.className} text-app-blue-primary`}>Page not found</p>
          <div className="mt-8">
            <Link
              href="/"
              className={`bg-app-blue-primary hover:bg-app-blue-primary-hover text-app-white font-medium py-3 px-6 rounded-full transition duration-300 ${geistSans.className}`}
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
