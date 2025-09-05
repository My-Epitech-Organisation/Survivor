"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAPIUrl } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { LuEye, LuEyeClosed } from "react-icons/lu"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = getAPIUrl();
      const response = await fetch(`${apiUrl}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      const userData = {
        id: data.user?.id || "1",
        email: data.user?.email || email,
        name: data.user?.name || "Startup Owner",
        role: data.user?.role || "user",
      };

      if (!data.access) {
        throw new Error("No token received from server. Login failed.");
      }
      login(data.access, userData);

      setEmail("");
      setPassword("");

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="/reset-password"
                      className="ml-auto text-sm underline-offset-2 hover:underline hover:text-app-blue-primary-hover"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-opacity duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <div className="relative w-5 h-5">
                        <LuEyeClosed
                          className={`absolute transition-all duration-300 ${
                            showPassword
                              ? "opacity-100 transform scale-100"
                              : "opacity-0 transform scale-75"
                          }`}
                        />
                        <LuEye
                          className={`absolute transition-all duration-300 ${
                            showPassword
                              ? "opacity-0 transform scale-75"
                              : "opacity-100 transform scale-100"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-app-blue-primary hover:bg-app-blue-primary-hover"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <a
                  href="/signup"
                  className="hover:underline underline-offset-2 hover:text-app-blue-primary-hover"
                >
                  Don&apos;t have an account?{" "}
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
