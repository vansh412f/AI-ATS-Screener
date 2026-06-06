"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Bot, Menu, Briefcase, FileText, LayoutDashboard } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Job Board", href: "/jobs", icon: Briefcase },
  { name: "Resume Screener", href: "/screener", icon: FileText },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white text-black">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                ATS Screener
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-900 hover:text-white focus:bg-zinc-900 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isActive ? "text-white" : "text-zinc-400"
                          )}
                        >
                          {item.name}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 px-4 text-sm font-medium rounded-lg",
                    "border-zinc-700 bg-transparent text-white",
                    "hover:bg-zinc-900 hover:text-white hover:border-zinc-600",
                    "transition-all duration-200"
                  )}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className={cn(
                    "h-9 px-4 text-sm font-semibold rounded-lg",
                    "bg-white text-black",
                    "hover:bg-zinc-200 active:scale-[0.98]",
                    "transition-all duration-200 shadow-sm shadow-white/10"
                  )}
                >
                  Sign Up
                </Button>
              </Link>
            </Show>

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-8 h-8 rounded-lg ring-1 ring-zinc-700 hover:ring-zinc-500 transition-all duration-200",
                  },
                }}
              />
            </Show>
          </div>

          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-2 text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-l border-zinc-800 bg-black p-0"
              >
                <SheetHeader className="p-6 border-b border-zinc-900 text-left">
                  <SheetTitle className="text-white flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white text-black">
                      <Bot className="w-5 h-5" />
                    </div>
                    ATS Screener
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-6 px-4 gap-6">
                  <div className="flex flex-col gap-2">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-zinc-900 text-white"
                              : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="h-px bg-zinc-900" />

                  <div className="flex flex-col gap-3">
                    <Show when="signed-out">
                      <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full border-zinc-700 bg-transparent text-white",
                            "hover:bg-zinc-900 hover:text-white hover:border-zinc-600",
                            "transition-all duration-200"
                          )}
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                        <Button
                          className={cn(
                            "w-full bg-white text-black font-semibold",
                            "hover:bg-zinc-200 active:scale-[0.98]",
                            "transition-all duration-200 shadow-sm shadow-white/10"
                          )}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </Show>

                    <Show when="signed-in">
                      <div className="flex items-center gap-3 px-1">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox:
                                "w-8 h-8 rounded-lg ring-1 ring-zinc-700",
                            },
                          }}
                        />
                        <span className="text-sm text-zinc-400">
                          My Account
                        </span>
                      </div>
                    </Show>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}