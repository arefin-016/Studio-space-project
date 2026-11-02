
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Image,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const user = Object.fromEntries(formData.entries());

    console.log(user);

const { data, error } = await authClient.signUp.email({
...user
});
if(data){
	console.log(data)
}
if(error){
	console.log(error)
}
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">

      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <User size={28} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Register now and explore amazing creative spaces.
          </p>
        </div>

        {/* Registration Form */}
        <div className="rounded-2xl border bg-card p-6 shadow-lg sm:p-8">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Profile Photo URL
              </label>

              <div className="relative">
                <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  name="photoURL"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-11 pl-10 pr-11"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Register Button */}
            <Button type="submit" className="h-11 w-full gap-2">
              Register
              <ArrowRight size={18} />
            </Button>

          </form>

          {/* Login Link */}
          <p className="mt-7 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signIn"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 StudioSpace. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
