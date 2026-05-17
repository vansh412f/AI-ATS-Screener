import Link from "next/link"
import { Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      
      <div className="w-full max-w-md space-y-6">
        {/* Header / Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome to Free ATS Screener
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to analyze your resume and discover top jobs.
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
            <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white">
              Register
            </TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black/50">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">Login</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                  Enter your email below to login to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-900 dark:text-zinc-300">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-900 dark:text-zinc-300">Password</Label>
                    <Link href="#" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="password" type="password" required className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-white" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">
                  Sign In
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Registration Form */}
          <TabsContent value="register">
            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black/50">
              <CardHeader>
                <CardTitle className="text-zinc-900 dark:text-white">Create an account</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                  Enter your details below to create your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-900 dark:text-zinc-300">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register" className="text-zinc-900 dark:text-zinc-300">Email</Label>
                  <Input id="email-register" type="email" placeholder="m@example.com" required className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register" className="text-zinc-900 dark:text-zinc-300">Password</Label>
                  <Input id="password-register" type="password" required className="border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-white" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">
                  Create Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}