import Link from 'next/link';
import { LayoutDashboard, Settings, Network } from 'lucide-react';

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
import { DashboardClient } from '@/components/dashboard-client';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

export default function DashboardPage() {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar side="right">
        <SidebarHeader className="border-b p-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Icons.logo className="size-8 text-primary" />
            <span className="font-bold text-lg group-data-[state=collapsed]:hidden">
              ConveyorAI
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" isActive={true} tooltip="Kontrol Paneli">
                <LayoutDashboard className="size-5" />
                <span className="group-data-[state=collapsed]:hidden">
                  Kontrol Paneli
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Accordion type="single" collapsible className="w-full px-2 group-data-[state=collapsed]:hidden">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-base">
                        <div className="flex items-center gap-2.5">
                            <Network className="size-5" />
                            <span>İstasyon</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pt-1">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=1" variant="ghost" size="sm" className="w-full justify-start text-base">Bant 1</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=2" variant="ghost" size="sm" className="w-full justify-start text-base">Bant 2</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=3" variant="ghost" size="sm" className="w-full justify-start text-base">Bant 3</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=4" variant="ghost" size="sm" className="w-full justify-start text-base">Bant 4</SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <SidebarMenuItem>
                <SidebarMenuButton href="/ayarlar" tooltip="Ayarlar">
                    <Settings className="size-5" />
                    <span className="group-data-[state=collapsed]:hidden">Ayarlar</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
           <div className="flex items-center gap-2.5">
             <Link href="/" className="flex items-center gap-2.5">
                <Icons.logo className="size-8 text-primary" />
                <h1 className="font-bold text-lg">ConveyorAI</h1>
             </Link>
           </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SidebarTrigger className="h-9 w-9" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
