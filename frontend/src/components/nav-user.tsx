"use client"

import * as React from "react"
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

export function NavUser({
  user: initialUser,
}: {
  user?: {
    name: string;
    email: string;
    avatar: string;
  }
}) {
  const { isMobile } = useSidebar()
  const { user: authUser, logout, getAccessToken, getUserProfile } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const profileFetchedRef = React.useRef(false)
  
  // Local user state with fallback to prop values
  const [user, setUser] = React.useState(() => ({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    avatar: initialUser?.avatar || "",
  }))
  
  // Fetch user profile once on mount if we're authenticated but don't have profile data
  React.useEffect(() => {
    const fetchUserProfileIfNeeded = async () => {
      // Only fetch if authenticated and we haven't fetched before
      if (authUser.isAuthenticated && !profileFetchedRef.current && !authUser.user?.first_name) {
        profileFetchedRef.current = true
        const token = getAccessToken()
        if (token) {
          await getUserProfile(token)
        }
      }
    }
    
    fetchUserProfileIfNeeded()
  }, [getAccessToken, getUserProfile, authUser])
  
  // Update local user state when auth user changes (separate from fetching)
  React.useEffect(() => {
    const userProfile = authUser.user;
    if (authUser.isAuthenticated && userProfile && (userProfile.first_name || userProfile.email)) {
      setUser(prevUser => ({
        name: userProfile.first_name && userProfile.last_name 
          ? `${userProfile.first_name} ${userProfile.last_name}` 
          : prevUser.name,
        email: userProfile.email || prevUser.email,
        avatar: prevUser.avatar // Keep existing avatar
      }))
    }
  }, [authUser.isAuthenticated, authUser.user])
  
  // Get initials for avatar fallback
  const getInitials = () => {
    const userProfile = authUser.user;
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()
    }
    if (user.name) {
      return user.name.split(' ')
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    }
    return 'U'
  }

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent double clicks
    setIsLoggingOut(true)
    
    try {
      await logout('/')
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-foreground focus:bg-accent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing out...</span>
                </div>
              ) : (
                'Sign out'
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 