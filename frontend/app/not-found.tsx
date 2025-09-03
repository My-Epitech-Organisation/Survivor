"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Geist, Geist_Mono, Bowlby_One } from 'next/font/google';
import Navigation from '@/components/Navigation';

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
      <div className={`flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 text-white flex items-center justify-center px-4 ${geistSans.variable} ${geistMono.variable} ${bowlbyOne.variable}`}>
        <div className="text-center">
          <h1 className={`text-[120px] md:text-[180px] font-bold text-blue-600 mb-1 ${bowlbyOne.className}`}>
            404
          </h1>
          <p className={`text-xl ${geistMono.className} text-blue-600`}>Page not found</p>
          <div className="mt-12">
            <Link 
              href="/" 
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition duration-300 ${geistSans.className}`}
            >
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}