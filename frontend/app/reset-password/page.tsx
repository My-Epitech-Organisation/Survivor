import Navigation from '@/components/Navigation';
import Footer from "@/components/Footer";
import { ResetPasswordForm } from '@/components/ResetPasswordForm';


export default function ResetPassword() {
  return (
    <>
      <div className="bg-muted h-screen flex flex-col w-full">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <ResetPasswordForm />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
