import { LoginForm } from "@/components/login-form";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";


export default function LoginPage() {
  return (
    <>
      <div className="bg-muted h-screen flex flex-col w-full">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <LoginForm />
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}
