"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import {
  Bot,
  Menu,
  Home,
  FileText,
  LayoutDashboard,
} from "lucide-react";
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
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Screener", href: "/screener", icon: FileText },
];

function GitHubIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.084 3.292 9.392 7.86 10.914.575.106.785-.25.785-.556 0-.274-.01-1-.016-1.962-3.197.695-3.872-1.541-3.872-1.541-.523-1.328-1.277-1.681-1.277-1.681-1.043-.713.079-.698.079-.698 1.154.081 1.761 1.186 1.761 1.186 1.025 1.756 2.69 1.249 3.344.955.103-.743.401-1.249.729-1.536-2.552-.29-5.236-1.276-5.236-5.682 0-1.255.449-2.282 1.184-3.086-.118-.29-.513-1.458.112-3.04 0 0 .967-.31 3.168 1.179a11.03 11.03 0 0 1 2.884-.388c.978.004 1.963.132 2.884.388 2.2-1.49 3.165-1.179 3.165-1.179.627 1.582.232 2.75.114 3.04.737.804 1.182 1.831 1.182 3.086 0 4.417-2.688 5.389-5.248 5.674.413.355.781 1.056.781 2.128 0 1.537-.014 2.776-.014 3.153 0 .309.207.667.79.554C20.21 21.388 23.5 17.082 23.5 12 23.5 5.648 18.352.5 12 .5Z" />
    </svg>
  );
}

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
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname === item.href;
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
            <a
              href="https://github.com/vansh412f/AI-ATS-Screener"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all duration-200"
              aria-label="View project on GitHub"
            >
              <GitHubIcon className="w-5 h-5" />
            </a>

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
                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname === item.href;
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

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-900" />
                    <a
                      href="https://github.com/vansh412f/AI-ATS-Screener"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900/50 text-xs font-medium transition-all duration-200"
                      aria-label="View project on GitHub"
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                    <div className="flex-1 h-px bg-zinc-900" />
                  </div>

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