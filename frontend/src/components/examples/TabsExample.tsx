"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TabsExample() {
  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and set email preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Username
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @username
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Email
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  example@email.com
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Current password
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ********
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  New password
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ********
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 