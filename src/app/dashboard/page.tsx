
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Settings, Network, FileText, Users, PlusCircle } from 'lucide-react';
import type { Station } from '@/components/dashboard-client';

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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <PageContent />
    </SidebarProvider>
  );
}


function PageContent() {
    const { setOpenMobile, isMobile } = useSidebar();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [stations, setStations] = useState<Station[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const savedStations = localStorage.getItem("conveyorAIStations");
            if (savedStations) {
                const parsedStations = JSON.parse(savedStations);
                if(Array.isArray(parsedStations) && parsedStations.length > 0) {
                   setStations(parsedStations);
                } else {
                  // If localStorage is corrupt or empty, set a default
                  const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
                  setStations(defaultStations);
                  localStorage.setItem("conveyorAIStations", JSON.stringify(defaultStations));
                }
            } else {
                const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
                setStations(defaultStations);
                localStorage.setItem("conveyorAIStations", JSON.stringify(defaultStations));
            }
        } catch (e) {
            console.error("Failed to load stations from localStorage", e);
            const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
            setStations(defaultStations);
        }
    }, []);

    // Listen for storage changes to update stations list dynamically
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'conveyorAIStations') {
                try {
                    if (event.newValue) {
                        setStations(JSON.parse(event.newValue));
                    }
                } catch (e) {
                    console.error("Failed to parse stations from storage event", e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    // Listen for URL changes to close mobile sidebar
    const selectedStationId = searchParams.get('station');
    useEffect(() => {
        if (isMobile) {
            setOpenMobile(false);
        }
    }, [selectedStationId, isMobile, setOpenMobile]);


    const handleLinkClick = (stationId: string) => {
        // We use router.push to ensure the page re-renders with the new search param
        router.push(`/dashboard?station=${stationId}`);
        if(isMobile) {
            setOpenMobile(false);
        }
    }
    
    // Determine the default station ID if none is selected
    const currentStationId = selectedStationId || (stations.length > 0 ? stations[0].id : '1');

    return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b p-3 justify-center">
            <div className="flex items-center gap-2.5">
                <Link href="/" className="flex items-center gap-2">
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
              <SidebarMenuButton href="/dashboard" isActive={!selectedStationId || selectedStationId === (stations.length > 0 ? stations[0].id : '')} tooltip="Kontrol Paneli">
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
                            {!isClient ? (
                                <div className="space-y-2 p-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ) : stations.length > 0 ? (
                                stations.map(station => (
                                    <SidebarMenuItem key={station.id}>
                                        <SidebarMenuButton 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start h-8 text-base" 
                                            isActive={currentStationId === station.id} 
                                            onClick={() => handleLinkClick(station.id)}>
                                            {station.name}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                <div className="text-center text-xs text-sidebar-foreground/70 p-4">
                                    İstasyon bulunamadı. Lütfen ayarlardan ekleyin.
                                </div>
                            )}
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
             <SidebarTrigger className="h-9 w-9" />
             <Link href="/" className="flex items-center gap-2.5 md:hidden">
                <Icons.logo className="size-8 text-primary" />
             </Link>
             <h1 className="font-bold text-lg hidden sm:block">ConveyorAI</h1>
           </div>
          <div className="flex items-center gap-4">
            {/* ThemeToggle has been removed */}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient stations={stations} onStationsChange={setStations} />
        </main>
      </SidebarInset>
    </>
  );
}
