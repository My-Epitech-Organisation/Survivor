"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAPIUrl } from "@/lib/config"


interface ResetPasswordConfirmFormProps {
  token: string;
}

export function ResetPasswordConfirmForm({token} : ResetPasswordConfirmFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          throw new Error(errorData.password.join(' '));
        }

        const errorMessages = [];
        for (const messages of Object.values(errorData)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages);
          } else if (typeof messages === 'string') {
            errorMessages.push(messages);
          }
        }

        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join(' '));
        }

        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      setSuccess(data.detail);

      setPassword("");
      setConfirmPassword("");

      router.push('/login')

    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
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
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full bg-app-blue-primary hover:bg-app-blue-primary-hover" disabled={isLoading}>
                  {isLoading ? "Resetting password..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
