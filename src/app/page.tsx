
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Settings, Network, FileText, Users } from 'lucide-react';

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
  useSidebar
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
    <SidebarProvider defaultOpen={true}>
      <PageContent />
    </SidebarProvider>
  );
}


function PageContent() {
    const { setOpenMobile, isMobile } = useSidebar();
    const searchParams = useSearchParams();
    const selectedBant = searchParams.get('bant') || '1';
    
    const handleLinkClick = () => {
        if(isMobile) {
            setOpenMobile(false);
        }
    }

    return (
    <>
      <Sidebar side="left">
        <SidebarHeader className="border-b p-3">
            <div className="flex items-center gap-2.5">
                <SidebarTrigger className="h-9 w-9 md:hidden" />
                 <Link href="/" className="flex items-center gap-2.5">
                    <Icons.logo className="size-8 text-primary" />
                    <span className="font-bold text-lg group-data-[state=collapsed]:hidden">
                    ConveyorAI
                    </span>
                </Link>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" isActive={!searchParams.get('bant')} tooltip="Kontrol Paneli">
                <LayoutDashboard className="size-5" />
                <span className="group-data-[state=collapsed]:hidden">
                  Kontrol Paneli
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full px-2 group-data-[state=collapsed]:hidden">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-base w-full justify-start data-[state=open]:bg-sidebar-accent">
                        <div className="flex items-center gap-2.5">
                            <Network className="size-5" />
                            <span>İstasyon</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pt-1">
                        <SidebarMenu className="p-0">
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=1" variant="ghost" size="sm" className="w-full justify-start h-8 text-base" isActive={selectedBant === '1'} onClick={handleLinkClick}>Bant 1</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=2" variant="ghost" size="sm" className="w-full justify-start h-8 text-base" isActive={selectedBant === '2'} onClick={handleLinkClick}>Bant 2</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=3" variant="ghost" size="sm" className="w-full justify-start h-8 text-base" isActive={selectedBant === '3'} onClick={handleLinkClick}>Bant 3</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/?bant=4" variant="ghost" size="sm" className="w-full justify-start h-8 text-base" isActive={selectedBant === '4'} onClick={handleLinkClick}>Bant 4</SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
             <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Raporlar" disabled>
                    <FileText className="size-5" />
                    <span className="group-data-[state=collapsed]:hidden">Raporlar</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <Accordion type="single" collapsible className="w-full px-2 group-data-[state=collapsed]:hidden">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-base w-full justify-start data-[state=open]:bg-sidebar-accent">
                        <div className="flex items-center gap-2.5">
                            <Users className="size-5" />
                            <span>Yönetim</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4 pt-1">
                        <SidebarMenu className="p-0">
                            <SidebarMenuItem>
                                <SidebarMenuButton href="#" variant="ghost" size="sm" className="w-full justify-start h-8 text-base" disabled>Operatörler</SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Ayarlar">
                    <Settings className="size-5" />
                    <span className="group-data-[state=collapsed]:hidden">Ayarlar</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
           <div className="flex items-center gap-2.5">
             <SidebarTrigger className="h-9 w-9 hidden md:flex" />
             <Link href="/" className="flex items-center gap-2.5 md:hidden">
                <Icons.logo className="size-8 text-primary" />
                <h1 className="font-bold text-lg hidden sm:block">ConveyorAI</h1>
             </Link>
           </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient />
        </main>
      </SidebarInset>
    </>
  );
}
