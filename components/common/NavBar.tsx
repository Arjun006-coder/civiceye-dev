"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full p-4 flex justify-between items-center z-50 transition-all ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      {/* Logo / Title */}
      <Link
        href="/"
        className={`text-xl font-bold ${scrolled ? "text-black" : "text-white"}`}
      >
        Civic-Eye
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className={`${scrolled ? "text-black hover:text-blue-600" : "text-white hover:text-blue-300"}`}
        >
          Dashboard
        </Link>
        <Link
          href="/leaderboard"
          className={`${scrolled ? "text-black hover:text-blue-600" : "text-white hover:text-blue-300"}`}
        >
          Leaderboard
        </Link>
        <Link
          href="/report"
          className={`${scrolled ? "text-black hover:text-blue-600" : "text-white hover:text-blue-300"}`}
        >
          Report Issue
        </Link>

        {/* Auth Buttons */}
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
