"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
}

export function MembersSettings() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'You',
      email: 'you@example.com',
      role: 'owner',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
    },
    {
      id: '3',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
    },
  ]);
  
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');

  const handleInviteMember = () => {
    // Here you would typically make an API call to invite the user
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
    };
    
    setMembers([...members, newMember]);
    setInviteEmail('');
    setInviteRole('member');
    setIsInviteDialogOpen(false);
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers(members.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'member':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'viewer':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
    }
  };

