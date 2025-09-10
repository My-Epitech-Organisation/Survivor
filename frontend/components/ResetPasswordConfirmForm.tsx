"use client";

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
import { LuEye, LuEyeClosed } from "react-icons/lu";

interface ResetPasswordConfirmFormProps {
  token: string;
}

export function ResetPasswordConfirmForm({
  token,
}: ResetPasswordConfirmFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = getAPIUrl();
      const link = `${apiUrl}/auth/password-reset/confirm/`;
      const response = await fetch(link, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          password_confirm: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.password && Array.isArray(errorData.password)) {
          throw new Error(errorData.password.join(" "));
        }

        const errorMessages = [];
        for (const messages of Object.values(errorData)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages);
          } else if (typeof messages === "string") {
            errorMessages.push(messages);
          }
        }

        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join(" "));
        }

        throw new Error(errorData.message || "Signup failed");
      }

      const data = await response.json();
      setSuccess(data.detail);

      setPassword("");
      setConfirmPassword("");

      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during signup"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-xl">Welcome</CardTitle>
          <CardDescription>
            Reset your password to access your account
          </CardDescription>
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
                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success}
                  </div>
                )}
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-opacity duration-200 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <div className="relative w-5 h-5">
                        <LuEyeClosed
                          className={`absolute transition-all duration-300 left-1/10 top-1/10 ${
                            showPassword
                              ? "opacity-100 transform scale-100"
                              : "opacity-0 transform scale-75"
                          }`}
                        />
                        <LuEye
                          className={`absolute transition-all duration-300 left-1/10 top-1/10 ${
                            showPassword
                              ? "opacity-0 transform scale-75"
                              : "opacity-100 transform scale-100"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-opacity duration-200 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <div className="relative w-5 h-5">
                        <LuEyeClosed
                          className={`absolute transition-all duration-300 left-1/10 top-1/10 ${
                            showConfirmPassword
                              ? "opacity-100 transform scale-100"
                              : "opacity-0 transform scale-75"
                          }`}
                        />
                        <LuEye
                          className={`absolute transition-all duration-300 left-1/10 top-1/10 ${
                            showConfirmPassword
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
                  className="w-full bg-jeb-primary hover:bg-jeb-hover cursor-pointer font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting password..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
