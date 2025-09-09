"use client";

import Link from "next/link";
import { Montserrat, Open_Sans } from "next/font/google";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export default function Custom404() {
  return (
    <div className="h-screen flex flex-col w-full">
      <Navigation />
      <div
        className={`flex-1 bg-gradient-to-br from-app-gradient-from to-app-gradient-to text-app-white flex items-center justify-center px-4 ${openSans.variable} ${montserrat.variable}`}
      >
        <div className="text-center">
          <h1
            className={`text-[120px] md:text-[180px] font-black text-app-blue-primary mb-1 ${montserrat.className}`}
          >
            <em>404</em>
          </h1>
          <p className={`text-xl ${openSans.className} text-app-blue-primary`}>
            Page not found
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className={`bg-app-blue-primary hover:bg-app-blue-primary-hover text-app-white font-medium py-3 px-6 rounded-full transition duration-300 ${openSans.className}`}
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
