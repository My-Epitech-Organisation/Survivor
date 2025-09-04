"use client"

import Navigation from '@/components/Navigation';
import Footer from "@/components/Footer";
import { useSearchParams } from 'next/navigation';
import { ResetPasswordConfirmForm } from '@/components/ResetPasswordConfirmForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function ResetPasswordConfirm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const tempToken = searchParams.get("token");

    if (tempToken) {
      setToken(tempToken);
    } else {
      router.push("/reset-password")
    }
  }, [searchParams, setToken, router]);

  return (
    <>
      <div className="bg-muted h-screen flex flex-col w-full">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <ResetPasswordConfirmForm token={token || ""} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
