import React from 'react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield,
  CreditCard,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const UserMenu = () => {
  const { currentUser, userProfile, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentUser) return null;

  const displayName = userProfile?.displayName || currentUser.displayName || 'User';
  const email = currentUser.email || '';
  const photoURL = currentUser.photoURL;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full glass border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <Avatar className="h-9 w-9">
            <AvatarImage src={photoURL || ''} alt={displayName} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-56 glass border border-primary/20 backdrop-blur-xl bg-background/95" 
        align="end" 
        forceMount
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
              {userProfile?.role && (
                <div className="flex items-center mt-2">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-border/20" />
          
          <DropdownMenuItem className="hover:bg-accent/10 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="hover:bg-accent/10 cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="hover:bg-accent/10 cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="hover:bg-accent/10 cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-border/20" />
          
          <DropdownMenuItem 
            className="hover:bg-destructive/10 text-destructive hover:text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;