

"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Network, User, Settings, Users } from '@/components/ui/lucide-icons';
import { AppSettings, Station, Operator } from '@/components/dashboard-client';

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
import { DashboardClient, SettingsContent } from '@/components/dashboard-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/context';
import { useRouter } from 'next/navigation';

const defaultSettings: AppSettings = {
  anomalyThreshold: 2.0,
  isSoundAlertEnabled: true,
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <PageContent />
    </SidebarProvider>
  );
}


function PageContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { logout } = useAuth();
    const router = useRouter();
    const view = searchParams.get('view');
    const section = searchParams.get('section');

    const [stations, setStations] = useState<Station[]>([]);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [operators, setOperators] = useState<Operator[]>([]);
    const [isClient, setIsClient] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    
    useEffect(() => {
        setIsClient(true);
        try {
            const savedStations = localStorage.getItem("konveyorAIStations");
            if (savedStations) {
                const parsedStations = JSON.parse(savedStations);
                if(Array.isArray(parsedStations) && parsedStations.length > 0) {
                   setStations(parsedStations);
                } else {
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
            
            const savedOperators = localStorage.getItem("konveyorAIOperators");
            if(savedOperators) {
              setOperators(JSON.parse(savedOperators));
            } else {
              const defaultOperators: Operator[] = [
                {id: '1', name: 'Mustafa Uslu', email: 'mustafa@example.com', title: 'Vardiya Amiri', phone: '555-123-4567', lastLogin: '2025-10-26 08:00'},
                {id: '2', name: 'Ayşe Yılmaz', email: 'ayse@example.com', title: 'Kalite Kontrol', phone: '555-987-6543', lastLogin: '2025-10-26 08:05'}
              ];
              setOperators(defaultOperators);
              localStorage.setItem("konveyorAIOperators", JSON.stringify(defaultOperators));
            }

        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            const defaultStations: Station[] = [{ id: '1', name: 'Bant 1', source: '/conveyor-video.mp4' }];
            setStations(defaultStations);
            setSettings(defaultSettings);
            const defaultOperators: Operator[] = [
              {id: '1', name: 'Mustafa Uslu', email: 'mustafa@example.com', title: 'Vardiya Amiri', phone: '555-123-4567', lastLogin: '2025-10-26 08:00'},
              {id: '2', name: 'Ayşe Yılmaz', email: 'ayse@example.com', title: 'Kalite Kontrol', phone: '555-987-6543', lastLogin: '2025-10-26 08:05'}
            ];
            setOperators(defaultOperators);
        }
    }, []);

    const saveOperators = useCallback((newOperators: Operator[]) => {
      setOperators(newOperators);
      if(isClient){
        localStorage.setItem("konveyorAIOperators", JSON.stringify(newOperators));
        toast({
            title: "Operatörler Güncellendi",
            description: "Değişiklikler başarıyla kaydedildi.",
        });
      }
    }, [isClient, toast]);

    const saveStations = useCallback((newStations: Station[]) => {
      setStations(newStations);
      if (isClient) {
        localStorage.setItem("konveyorAIStations", JSON.stringify(newStations));
         toast({
            title: "İstasyonlar Güncellendi",
            description: "Değişiklikler anında kaydedildi.",
        });
      }
    }, [isClient, toast]);

    const saveSettings = useCallback((newSettings: AppSettings) => {
        setSettings(newSettings);
        if (isClient) {
          localStorage.setItem("konveyorAISettings", JSON.stringify(newSettings));
           toast({
            title: "Ayarlar Güncellendi",
            description: "Değişiklikler anında kaydedildi.",
        });
        }
    }, [isClient, toast]);

    const handleLogout = () => {
      logout();
      router.push('/login');
    }

    const currentStationId = searchParams.get('station') || (stations.length > 0 ? stations[0].id : null);
    const isSettingsView = view === 'settings';

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
                 <SidebarMenuButton tooltip="Kontrol Paneli" className="data-[state=open]:bg-sidebar-accent pointer-events-none">
                    <LayoutDashboard className="size-5" />
                    <span className="group-data-[state=collapsed]:hidden">Kontrol Paneli</span>
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
                                    isActive={!isSettingsView && currentStationId === station.id} 
                                    >
                                    <Link href={`/dashboard?station=${station.id}`}>{station.name}</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                    ) : (
                        <div className="text-center text-xs text-sidebar-foreground/70 p-4">
                            İstasyon yok.
                        </div>
                    )}
                </SidebarMenu>
            </SidebarMenuItem>

            <SidebarMenuItem>
                 <SidebarMenuButton tooltip="Ayarlar" className="pointer-events-none">
                    <Settings className="size-5" />
                    <span className="group-data-[state=collapsed]:hidden">Ayarlar</span>
                </SidebarMenuButton>
                <SidebarMenu className="p-0 pl-7 pt-1 group-data-[state=collapsed]:hidden">
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild variant="ghost" size="sm" className="w-full justify-start h-8 text-base" isActive={isSettingsView && section === 'operators'}>
                           <Link href="/dashboard?view=settings&section=operators"><Users className="mr-2 h-4 w-4" />Operatörler</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex flex-1 items-center gap-4">
            <SidebarTrigger className="md:hidden" />
             <div className="hidden xs:flex">
              <h1 className="font-bold text-lg">{isSettingsView ? 'Operatör Yönetimi' : 'Kontrol Paneli'}</h1>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
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
                <DropdownMenuItem onClick={handleLogout}>
                    Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {isSettingsView ? (
                 <SettingsContent
                    activeSection={section || 'operators'}
                    operators={operators}
                    onOperatorsChange={saveOperators}
                 />
            ) : (
                <DashboardClient 
                    stations={stations} 
                    settings={settings}
                    onStationsChange={saveStations}
                    onSettingsChange={saveSettings}
                    audioRef={audioRef}
                />
            )}
        </main>
      </SidebarInset>
    </>
  );
}

