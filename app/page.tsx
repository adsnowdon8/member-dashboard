"use client";

import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-foreground mb-8">
          Kalos Member Dashboard
        </h1>
        <div className="flex rounded-xl border border-foreground/10 overflow-hidden mb-6">
          <button
            onClick={() => setView("signin")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              view === "signin"
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setView("signup")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              view === "signup"
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Sign up
          </button>
        </div>

        {view === "signin" ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
}
