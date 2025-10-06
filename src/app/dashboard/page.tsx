
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Network, User, Settings } from '@/components/ui/lucide-icons';
import type { Station, AppSettings } from '@/components/dashboard-client';

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
import { DashboardClient, SettingsDialog } from '@/components/dashboard-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const defaultSettings: AppSettings = {
  anomalyThreshold: 2.0,
  isSoundAlertEnabled: true,
};

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
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isClient, setIsClient] = useState(false);
    
    // Refs for dialog to access
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);


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

            const savedSettings = localStorage.getItem("konveyorAISettings");
            if (savedSettings) {
              setSettings(JSON.parse(savedSettings));
            } else {
              localStorage.setItem("konveyorAISettings", JSON.stringify(defaultSettings));
            }

        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
            setStations(defaultStations);
            setSettings(defaultSettings);
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
            if (event.key === 'konveyorAISettings') {
                try {
                    if (event.newValue) {
                        setSettings(JSON.parse(event.newValue));
                    }
                } catch (e) {
                    console.error("Failed to parse settings from storage event", e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const saveSettings = useCallback((newSettings: AppSettings) => {
      setSettings(newSettings);
      if (isClient) {
          localStorage.setItem("konveyorAISettings", JSON.stringify(newSettings));
           window.dispatchEvent(new StorageEvent('storage', { key: 'konveyorAISettings', newValue: JSON.stringify(newSettings) }));
      }
    }, [isClient]);
  
    const saveStations = useCallback((newStations: Station[]) => {
      setStations(newStations);
      if (isClient) {
          localStorage.setItem("konveyorAIStations", JSON.stringify(newStations));
          window.dispatchEvent(new StorageEvent('storage', { key: 'konveyorAIStations', newValue: JSON.stringify(newStations) }));
      }
    }, [isClient]);

    const handleCalibrate = () => {
        setIsCalibrating(true);
        setCalibrationProgress(0);
        // This is a simplified version of what was in dashboard-client
        const progressInterval = setInterval(() => {
          setCalibrationProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              setIsCalibrating(false);
              // Potentially show a toast notification for completion
              return 100;
            }
            return prev + 10;
          });
        }, 300);
    };
    
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
              <SidebarMenuButton href="/dashboard" isActive={!searchParams.get('station')} tooltip="Kontrol Paneli">
                <LayoutDashboard className="size-5" />
                <span className="group-data-[state=collapsed]:hidden">
                  Kontrol Paneli
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
                 <SidebarMenuButton tooltip="İstasyonlar" className="pointer-events-none">
                    <Network className="size-5" />
                    <span className="group-data-[state=collapsed]:hidden">İstasyonlar</span>
                </SidebarMenuButton>
                <SidebarMenu className="p-0 pl-7 pt-1 group-data-[state=collapsed]:hidden">
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
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex flex-1 items-center gap-4">
            <SidebarTrigger className="md:hidden" />
             <div className="hidden sm:flex">
              <h1 className="font-bold text-lg">Kontrol Paneli</h1>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <SettingsDialog 
                settings={settings} 
                onSettingsChange={saveSettings} 
                stations={stations}
                onStationsChange={saveStations}
                audioRef={audioRef}
                isCalibrating={isCalibrating}
                calibrationProgress={calibrationProgress}
                onCalibrate={handleCalibrate}
              >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border w-9 h-9">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Kullanıcı menüsünü aç</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <SettingsDialog.Trigger asChild>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ayarlar</span>
                    </DropdownMenuItem>
                  </SettingsDialog.Trigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </SettingsDialog>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <DashboardClient 
            stations={stations} 
            settings={settings}
            isCalibrating={isCalibrating}
            setIsCalibrating={setIsCalibrating}
            setCalibrationProgress={setCalibrationProgress}
            audioRef={audioRef}
          />
        </main>
      </SidebarInset>
    </>
  );
}
