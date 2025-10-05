
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Network, User, Settings } from '@/components/ui/lucide-icons';
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
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
              <SidebarMenuButton href="/dashboard" isActive={true} tooltip="Kontrol Paneli">
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
                            <span>İstasyonlar</span>
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
                                    İstasyon bulunamadı.
                                </div>
                            )}
                        </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex flex-1 items-center gap-4">
            <SidebarTrigger className="md:hidden" />
             <div className="hidden sm:flex">
              <h1 className="font-bold text-lg">Kontrol Paneli</h1>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full border w-9 h-9">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Kullanıcı menüsünü aç</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient stations={stations} onStationsChange={setStations} />
        </main>
      </SidebarInset>
    </>
  );
}
