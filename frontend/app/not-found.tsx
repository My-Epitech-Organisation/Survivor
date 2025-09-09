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
    <div className="h-screen flex flex-col w-full bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50">
      <Navigation />
      <div
        className={`flex-1 text-app-white flex items-center justify-center px-4 ${openSans.variable} ${montserrat.variable}`}
      >
        <div className="text-center">
          <h1
            className={`text-9xl font-black text-jeb-primary mb-1 ${montserrat.className}`}
          >
            <em>404</em>
          </h1>
          <p className={`text-xl ${montserrat.className} text-jeb-primary`}>
            <em>Page not found</em>
          </p>
          <div className="mt-24">
            <Link
              href="/"
              className={`bg-jeb-primary hover:bg-jeb-hover text-app-white font-medium py-3 px-6 rounded-full transition duration-300 ${openSans.className}`}
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
