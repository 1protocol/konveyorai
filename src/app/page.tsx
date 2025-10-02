import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { UserNav } from '@/components/user-nav';
import { DashboardClient } from '@/components/dashboard-client';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/" className="flex items-center gap-2 p-2">
            <Icons.logo className="size-8 text-primary" />
            <span className="font-bold text-lg hidden group-data-[state=expanded]:inline">
              ConveyorGuard
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" isActive={true} tooltip="Dashboard">
                <LayoutDashboard />
                <span className="group-data-[state=collapsed]:hidden">
                  Dashboard
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Settings">
                <Settings />
                <span className="group-data-[state=collapsed]:hidden">
                  Settings
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
