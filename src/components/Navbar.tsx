"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, Menu, Briefcase, FileText, LayoutDashboard } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Board', href: '/jobs', icon: Briefcase },
    { name: 'Resume Screener', href: '/screener', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <div className="flex h-9 w-9 items-center justify-center text-white-500">
                <Bot className="h-6 w-6" />
              </div>
              <span>ATS Screener</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:block">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
                          <item.icon className="h-4 w-4 text-zinc-500" />
                          {item.name}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="hidden sm:flex">
            <Link href="/login">
            <Button variant="outline" className="text-white border-zinc-700 bg-transparent hover:bg-zinc-900 hover:text-white">
              Sign In
            </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-900">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <Bot className="h-5 w-5 text-white-600" />
                    ATS Screener
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <item.icon className="h-5 w-5 text-slate-500" />
                      {item.name}
                    </Link>
                  ))}
                  <div className="mt-4 border-t pt-4">
                    <Link href="/login">
                        <Button variant="outline" className="text-white border-zinc-700 bg-transparent hover:bg-zinc-900 hover:text-white">
                            Sign In
                        </Button>
                    </Link>
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