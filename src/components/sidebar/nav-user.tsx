'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useRef } from 'react';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export default function NavUser() {
  const { user } = useUser();
  const { isMobile } = useSidebar();
  const userButtonRef = useRef<HTMLDivElement>(null);

  if (!user) return;

  const handleButtonClick = () => {
    // Find the button element inside the UserButton container and click it
    const buttonElement = userButtonRef.current?.querySelector('button');
    buttonElement?.click();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleButtonClick}
        >
          <div ref={userButtonRef}>
            <UserButton />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.fullName}</span>
            <span className="truncate text-xs">
              {user.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
