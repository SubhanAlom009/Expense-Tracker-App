import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../public/logo-Photoroom.png";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

async function Header() {

  await checkUser()
  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/">
          <Image
            src={logo}
            alt="Logo"
            width={100}
            height={100}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
            >
              <Button variant={"outline"} className={"cursor-pointer"}>
                <LayoutDashboard size={18} className="mr-2 h-4 w-4" />
                <span className="md:inline hidden">Dashboard</span>
              </Button>
            </Link>

            <Link href="/transaction/create">
              <Button className="flex items-center gap-2 cursor-pointer">
                <PenBox size={18} className="mr-2 h-4 w-4" />
                <span className="md:inline hidden">transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant={"outline"}
                className="bg-white text-gray-800 cursor-pointer hover:bg-gray-100"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-16 w-16",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
}

export default Header;
