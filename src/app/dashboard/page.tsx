
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Settings, Network, FileText, Users } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { DashboardClient } from '@/components/dashboard-client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
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
    const searchParams = useSearchParams();

    const [stations, setStations] = useState<Station[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const savedStations = localStorage.getItem("konveyorAIStations");
            if (savedStations) {
                const parsedStations = JSON.parse(savedStations);
                if(Array.isArray(parsedStations) && parsedStations.length > 0) {
                   setStations(parsedStations);
                } else {
                  // If localStorage is corrupt or empty, set a default
                  const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
                  setStations(defaultStations);
                  localStorage.setItem("konveyorAIStations", JSON.stringify(defaultStations));
                }
            } else {
                const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
                setStations(defaultStations);
                localStorage.setItem("konveyorAIStations", JSON.stringify(defaultStations));
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
            if (event.key === 'konveyorAIStations') {
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
    
    // Determine the default station ID if none is selected
    const currentStationId = searchParams.get('station') || (stations.length > 0 ? stations[0].id : '1');

    return (
    <>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
           <div className="flex items-center gap-2.5">
             <Link href="/" className="flex items-center gap-2.5 md:hidden">
                <Icons.logo className="size-8 text-primary" />
             </Link>
             <h1 className="hidden font-bold text-lg sm:block">Konveyor AI</h1>
           </div>
          <div className="flex items-center gap-4">
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient stations={stations} onStationsChange={setStations} />
        </main>
      </SidebarInset>
      <Sidebar>
        <SidebarHeader className="border-b p-3 justify-center">
            <div className="flex items-center gap-2.5">
                <Link href="/" className="flex items-center gap-2">
                    <Icons.logo className="size-8 text-primary" />
                    <span className="font-bold text-lg group-data-[state=collapsed]:hidden">
                    Konveyor AI
                    </span>
                </Link>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive={!searchParams.get('station') || searchParams.get('station') === (stations.length > 0 ? stations[0].id : '')} tooltip="Kontrol Paneli">
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
                                            asChild
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start h-8 text-base" 
                                            isActive={currentStationId === station.id} 
                                            >
                                            <Link href={`/dashboard?station=${station.id}`}>{station.name}</Link>
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
    </>
  );
}

    
