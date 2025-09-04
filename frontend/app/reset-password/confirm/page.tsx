"use client"

import Navigation from '@/components/Navigation';
import Footer from "@/components/Footer";
import { useSearchParams } from 'next/navigation';
import { ResetPasswordConfirmForm } from '@/components/ResetPasswordConfirmForm';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function ResetPasswordConfirmContent() {
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
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordConfirmForm token={token || ""} />
      </div>
    </div>
  );
}

export default function ResetPasswordConfirm() {
  return (
    <>
      <div className="bg-muted h-screen flex flex-col w-full">
        <Navigation />
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
              <div className="text-center">Loading...</div>
            </div>
          </div>
        }>
          <ResetPasswordConfirmContent />
        </Suspense>
        <Footer />
      </div>
    </>
  );
}
