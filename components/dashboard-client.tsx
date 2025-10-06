
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Video,
  Settings,
  BrainCircuit,
  Bell,
  Users,
  Camera,
  Loader,
  VideoOff,
  Scan,
  PlusCircle,
  Trash2,
  ChevronDown,
  AreaChart,
  Network,
  Check,
} from "@/components/ui/lucide-icons";
import { analyzeConveyorBelt } from "@/ai/flows/analyze-conveyor-flow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";


type AnomalyLog = {
  timestamp: string;
  deviation: number;
  stationId: string;
};

type DeviationData = {
    time: string;
    deviation: number;
}

export type AppSettings = {
  anomalyThreshold: number;
  isSoundAlertEnabled: boolean;
};

export type Station = {
  id: string;
  name: string;
  source: string;
};

const defaultSettings: AppSettings = {
  anomalyThreshold: 2.0,
  isSoundAlertEnabled: true,
};

export function DashboardClient({ stations, onStationsChange }: { stations: Station[], onStationsChange: (stations: Station[]) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedStationId = searchParams.get('station') || (stations.length > 0 ? stations[0].id : null);
  
  const selectedStation = stations.find(s => s.id === selectedStationId) || (stations.length > 0 ? stations[0] : null);

  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [deviation, setDeviation] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "ANOMALİ" | "KALİBRE EDİLİYOR">(
    "NORMAL"
  );
  const [logs, setLogs] = useState<AnomalyLog[]>([]);
  const [deviationData, setDeviationData] = useState<DeviationData[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameId = useRef<number>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoSource = selectedStation?.source || '/conveyor-video.mp4';
  const isWebcam = videoSource === 'webcam';
  const isAnomaly = status === "ANOMALİ";

  // --- Data Persistence Effects ---
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const savedSettings = localStorage.getItem("konveyorAISettings");
        const savedLogs = localStorage.getItem("konveyorAILogs");

        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          localStorage.setItem("konveyorAISettings", JSON.stringify(defaultSettings));
        }
        
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (error) {
        console.error("Yerel depolamadan ayarlar okunurken hata oluştu:", error);
        toast({
            variant: "destructive",
            title: "Ayarlar Yüklenemedi",
            description: "Ayarlarınız yüklenirken bir sorun oluştu.",
        });
      }
    }
  }, [isClient, toast]);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    if (isClient) {
        localStorage.setItem("konveyorAISettings", JSON.stringify(newSettings));
         window.dispatchEvent(new StorageEvent('storage', { key: 'konveyorAISettings', newValue: JSON.stringify(newSettings) }));
    }
  }, [isClient]);

  const saveStations = useCallback((newStations: Station[]) => {
    onStationsChange(newStations);
    if (isClient) {
        localStorage.setItem("konveyorAIStations", JSON.stringify(newStations));
        window.dispatchEvent(new StorageEvent('storage', { key: 'konveyorAIStations', newValue: JSON.stringify(newStations) }));
    }
  }, [isClient, onStationsChange]);

  const saveLogs = useCallback((newLogs: AnomalyLog[]) => {
    setLogs(newLogs);
    if (isClient) {
        localStorage.setItem("konveyorAILogs", JSON.stringify(newLogs));
    }
  }, [isClient]);


  const playAlertSound = useCallback(() => {
    if (settings.isSoundAlertEnabled && audioRef.current) {
        if (audioRef.current.src && !audioRef.current.src.endsWith('null')) {
            audioRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
        }
    }
  }, [settings.isSoundAlertEnabled]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    setDeviation(0);
    setStatus("NORMAL");
    setIsCalibrating(false);
    setCalibrationProgress(0);
    setHasCameraPermission(null);
    setDeviationData([]);
    stopCameraStream(); // Stop any previous stream

    const videoElement = videoRef.current;
    if (!videoElement || !selectedStation) return;

    if (isWebcam) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.src = ""; // Clear src for srcObject to work
            videoRef.current.play().catch(e => console.error("Webcam oynatma hatası:", e));
          }
        } catch (error) {
          console.error('Kamera erişim hatası:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Kamera Erişimi Reddedildi',
            description: 'Bu özelliği kullanmak için tarayıcı ayarlarından kamera izinlerini etkinleştirin.',
          });
        }
      };
      getCameraPermission();
    } else {
        const videoUrl = videoSource.startsWith('http') ? videoSource : window.location.origin + videoSource;
        if (videoRef.current.src !== videoUrl) {
            videoRef.current.srcObject = null; // Clear srcObject for src to work
            videoRef.current.src = videoUrl;
            videoRef.current.load();
            videoRef.current.play().catch(e => console.error("Video oynatma hatası:", e));
        }
    }
    
    return () => {
      stopCameraStream();
    }

  }, [selectedStation, isWebcam, toast, videoSource]);


  useEffect(() => {
    const analyzeFrame = async () => {
      if (isCalibrating || isProcessing || !videoRef.current || !captureCanvasRef.current || !selectedStation) return;
  
      setIsProcessing(true);
  
      const video = videoRef.current;
      if (video.paused || video.ended || video.readyState < 3) { 
        setIsProcessing(false);
        return;
      }
      
      if (isWebcam && hasCameraPermission === false) {
        setIsProcessing(false);
        return;
      }

      const canvas = captureCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');

      if(context){
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameDataUri = canvas.toDataURL('image/jpeg');
    
        try {
          const result = await analyzeConveyorBelt({ frameDataUri });
          const newDeviation = result.deviation;
          setDeviation(newDeviation);
    
          const now = new Date();
          const newTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setDeviationData(prevData => [...prevData, { time: newTime, deviation: newDeviation }].slice(-30)); // Keep last 30 data points


          if (newDeviation >= settings.anomalyThreshold) {
            if (status !== "ANOMALİ") {
              playAlertSound();
            }
            setStatus("ANOMALİ");
            const newLog: AnomalyLog = { 
                timestamp: now.toISOString(), 
                deviation: newDeviation,
                stationId: selectedStation.id
            };
            saveLogs([newLog, ...logs].slice(0, 100));

          } else {
             setStatus("NORMAL");
          }
        } catch (error) {
          console.error("Yapay zeka analizi hatası:", error);
           toast({
            variant: "destructive",
            title: "Analiz Hatası",
            description: "Görüntü işlenirken bir hata oluştu.",
          });
        } finally {
           setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    };
  
    const interval = setInterval(analyzeFrame, 2000);
    return () => clearInterval(interval);
  }, [isCalibrating, isProcessing, toast, settings.anomalyThreshold, status, playAlertSound, selectedStation, logs, saveLogs, isWebcam, hasCameraPermission]);

  // Effect to draw detection lines
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!overlay || !video ) return;

    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    let pulseOpacity = 1;
    let pulseDirection = -1;

    const draw = () => {
        if (!overlay || !video || video.readyState < 2) {
            animationFrameId.current = requestAnimationFrame(draw);
            return;
        }
        
        // Resize overlay to match video element size
        if (overlay.width !== video.clientWidth || overlay.height !== video.clientHeight) {
            overlay.width = video.clientWidth;
            overlay.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, overlay.width, overlay.height);

        if (isCalibrating || status === "KALİBRE EDİLİYOR") {
            animationFrameId.current = requestAnimationFrame(draw);
            return;
        }

        const lineY = overlay.height / 2; // Horizontal center
        const deviationScale = 25; // Pixels per mm
        const deviationPx = deviation * deviationScale;

        // --- Draw Reference Line ---
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(overlay.width, lineY);
        ctx.stroke();
        ctx.setLineDash([]);


        if (Math.abs(deviation) > 0.1) {
            // --- Pulsing animation for anomaly ---
            if (isAnomaly) {
                pulseOpacity += pulseDirection * 0.05;
                if (pulseOpacity < 0.3 || pulseOpacity > 1) {
                    pulseDirection *= -1;
                    pulseOpacity = Math.max(0.3, Math.min(1, pulseOpacity));
                }
            } else {
                pulseOpacity = 1;
            }
            
            const anomalyColor = `rgba(255, 20, 20, ${pulseOpacity})`;
            const normalColor = 'rgba(255, 165, 0, 1)';
            const currentColor = isAnomaly ? anomalyColor : normalColor;
            
            // --- Draw Deviation Line (Ruler) ---
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, lineY - deviationPx);
            ctx.lineTo(overlay.width, lineY - deviationPx);
            ctx.stroke();

            // --- Draw Measurement/Ruler Marks ---
            ctx.lineWidth = 1;
            const startY = Math.min(lineY, lineY - deviationPx);
            const endY = Math.max(lineY, lineY - deviationPx);

            for (let i = 0; i < overlay.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, startY);
                ctx.lineTo(i, endY);
                ctx.stroke();
            }

            // --- Draw Text ---
            ctx.fillStyle = currentColor;
            ctx.font = 'bold 18px var(--font-body), sans-serif';
            ctx.textAlign = 'left';
            ctx.shadowColor = "black";
            ctx.shadowBlur = 5;
            ctx.fillText(`${deviation.toFixed(2)} mm`, 10, lineY - deviationPx - 10);
            ctx.shadowBlur = 0;
        }

        animationFrameId.current = requestAnimationFrame(draw);
    };

    animationFrameId.current = requestAnimationFrame(draw);

    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    };
}, [deviation, isAnomaly, isCalibrating, status]);


  useEffect(() => {
    if (isCalibrating && calibrationProgress === 100) {
      toast({
        title: "Kalibrasyon Tamamlandı",
        description: `${selectedStation?.name || 'Mevcut istasyon'} için başlangıç referans verileri ayarlandı.`,
      });
    }
  }, [calibrationProgress, isCalibrating, toast, selectedStation]);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setStatus("KALİBRE EDİLİYOR");
    setCalibrationProgress(0);
    setDeviationData([]);

    const progressInterval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsCalibrating(false);
          setStatus("NORMAL");
          setDeviation(0);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  const handleStationSelect = (stationId: string) => {
    const newPath = `${pathname}?station=${stationId}`;
    router.push(newPath);
  };
  
  const filteredLogs = selectedStationId ? logs.filter(log => log.stationId === selectedStationId) : [];

  if (!isClient || !selectedStation) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
       <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="min-w-56 justify-between text-base bg-background/80 backdrop-blur-xl border-white/10 hover:bg-background/90 transition-all duration-300">
                       <span className="flex items-center gap-2">
                         <Network className="h-5 w-5 text-muted-foreground" />
                         {selectedStation.name}
                       </span>
                       <ChevronDown className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 text-base p-2 bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl transition-all duration-300">
                    {stations.map(station => (
                         <DropdownMenuItem key={station.id} onSelect={() => handleStationSelect(station.id)} className="p-2 cursor-pointer">
                           <Network className="mr-2 h-5 w-5" />
                            <span className="flex-grow">{station.name}</span>
                            {station.id === selectedStationId && <Check className="h-5 w-5" />}
                         </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <SettingsDialog 
              settings={settings} 
              onSettingsChange={saveSettings} 
              stations={stations}
              onStationsChange={saveStations}
              audioRef={audioRef} 
              isCalibrating={isCalibrating}
              calibrationProgress={calibrationProgress}
              onCalibrate={handleCalibrate}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-6 lg:space-y-8">
          <Card className="transition-all duration-300 bg-background/30 backdrop-blur-xl border border-white/10 hover:border-white/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Video />
                    Canlı İzleme - {selectedStation.name}
                    {isProcessing && <Scan className="h-5 w-5 text-primary animate-pulse" />}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video w-full rounded-md bg-black/50 overflow-hidden border border-white/10">
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      muted 
                      playsInline 
                      loop={!isWebcam}
                      crossOrigin="anonymous"
                      key={videoSource + selectedStation.id}
                    />
                    <canvas ref={captureCanvasRef} className="hidden" />
                    <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                    
                    {isWebcam && hasCameraPermission === false && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center text-white p-4">
                            <VideoOff className="h-16 w-16 mb-4" />
                            <h3 className="text-xl font-semibold">Kamera Erişimi Gerekli</h3>
                            <p className="text-muted-foreground text-white/80">
                               Canlı görüntüyü başlatmak için lütfen tarayıcınızın ayarlarından kamera izni verin.
                            </p>
                        </div>
                    )}

                    {isProcessing && !isCalibrating && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-medium rounded-md px-2 py-1 flex items-center gap-1">
                        <Loader className="w-3 h-3 animate-spin"/>
                        <span>Analiz ediliyor...</span>
                      </div>
                    )}
                     <audio ref={audioRef} src="/alert-sound.mp3" preload="auto"></audio>
                </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 bg-background/30 backdrop-blur-xl border border-white/10 hover:border-white/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <AreaChart />
                    Gerçek Zamanlı Sapma Grafiği (mm)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-64 sm:h-auto sm:aspect-[16/6]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={deviationData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background) / 0.8)',
                                borderColor: 'hsl(var(--border))',
                                backdropFilter: 'blur(4px)',
                            }}
                            labelStyle={{color: 'hsl(var(--foreground))'}}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="deviation" 
                            stroke={isAnomaly ? "hsl(var(--destructive))" : "hsl(var(--accent))"}
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false}
                        />
                        <ReferenceLine y={settings.anomalyThreshold} label={{ value: 'Eşik', position: 'insideTopLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                <Card className={cn("transition-all duration-300 bg-background/30 backdrop-blur-xl border border-white/10", isAnomaly && "bg-destructive/30 text-white border-red-500/50")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Sistem Durumu
                      {status === "NORMAL" && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {status === "ANOMALİ" && <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />}
                      {status === "KALİBRE EDİLİYOR" && <SlidersHorizontal className="h-5 w-5 text-accent" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                       {status}
                    </div>
                    <p className={cn("text-xs", isAnomaly ? "text-red-200" : "text-muted-foreground")}>
                      {isAnomaly
                        ? `Sapma eşiği aşıldı.`
                        : status === "NORMAL"
                        ? "Parametreler dahilinde."
                        : "Referans oluşturuluyor..."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-background/30 backdrop-blur-xl border border-white/10 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Mevcut Sapma
                      <span className="text-muted-foreground">(AI)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        deviation >= settings.anomalyThreshold && "text-red-400"
                      )}
                    >
                      {deviation.toFixed(2)} mm
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gerçek zamanlı ölçüm
                    </p>
                  </CardContent>
                </Card>
            </div>
            <Card className="transition-all duration-300 bg-background/30 backdrop-blur-xl border border-white/10 hover:border-white/20">
                <CardHeader>
                <CardTitle>Anomali Kayıtları</CardTitle>
                <CardDescription>
                    İstasyon: {selectedStation.name}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="relative max-h-[calc(100vh-38rem)] overflow-y-auto">
                    <Table>
                    <TableHeader className="sticky top-0 bg-card/80 backdrop-blur-sm">
                        <TableRow>
                        <TableHead>Zaman</TableHead>
                        <TableHead className="text-right">Sapma</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, index) => (
                            <TableRow key={index} className="hover:bg-white/5">
                            <TableCell>{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</TableCell>
                            <TableCell className="text-right font-medium text-red-400">
                                {log.deviation.toFixed(2)} mm
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell
                            colSpan={2}
                            className="h-24 text-center text-muted-foreground"
                            >
                            Henüz anomali yok.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

const settingsNavItems = [
  { id: "ai", label: "Yapay Zeka", icon: BrainCircuit },
  { id: "stations", label: "İstasyonlar", icon: Camera },
  { id: "notifications", label: "Bildirimler", icon: Bell },
  { id: "operators", label: "Operatörler", icon: Users },
] as const;

type SettingsSection = (typeof settingsNavItems)[number]['id'];

function SettingsDialog({
  settings,
  onSettingsChange,
  stations,
  onStationsChange,
  audioRef,
  isCalibrating,
  calibrationProgress,
  onCalibrate,
}: {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  stations: Station[];
  onStationsChange: (stations: Station[]) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isCalibrating: boolean;
  calibrationProgress: number;
  onCalibrate: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("ai");
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [currentStations, setCurrentStations] = useState(stations);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentSettings(settings);
      setCurrentStations(stations);
      setActiveSection("ai");
    }
  }, [settings, stations, isOpen]);

  const handleSave = () => {
    onSettingsChange(currentSettings);
    onStationsChange(currentStations);
    setIsOpen(false);
    toast({
        title: "Ayarlar Kaydedildi",
        description: "Yeni yapılandırmanız başarıyla kaydedildi.",
    });
  };
  
  const handleSoundSwitchChange = (checked: boolean) => {
    setCurrentSettings({ ...currentSettings, isSoundAlertEnabled: checked });
    if (checked && audioRef.current) {
        if (!audioRef.current.src || audioRef.current.src.endsWith('null')) {
            audioRef.current.src = "/alert-sound.mp3";
            audioRef.current.load();
        }
        audioRef.current.play().catch(e => console.error("Test sesi çalınamadı:", e));
    }
  };

  const handleStationFieldChange = (id: string, field: 'name' | 'source', value: string) => {
    setCurrentStations(prev => 
      prev.map(station => station.id === id ? {...station, [field]: value} : station)
    );
  };

  const handleAddStation = () => {
    const newId = (Date.now() + Math.random()).toString(36);
    const newStation: Station = {
        id: newId,
        name: `Yeni İstasyon ${currentStations.length + 1}`,
        source: '/conveyor-video.mp4'
    };
    setCurrentStations(prev => [...prev, newStation]);
  };

  const handleRemoveStation = (id: string) => {
    if (currentStations.length <= 1) {
        toast({
            variant: 'destructive',
            title: 'Son İstasyon Silinemez',
            description: 'Sistemde en az bir istasyon bulunmalıdır.',
        });
        return;
    }
    setCurrentStations(prev => prev.filter(station => station.id !== id));
  };
  
  const handleScanNetwork = () => {
    toast({
        title: "Özellik Yakında",
        description: "Ağdaki kameraları otomatik bulma özelliği geliştirme aşamasındadır.",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="text-base bg-background/80 backdrop-blur-xl border-white/10 hover:bg-background/90 transition-all duration-300">
          <Settings className="mr-2 h-5 w-5" />
          Gelişmiş Ayarlar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] flex flex-col bg-background/80 backdrop-blur-xl border-white/10 p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Gelişmiş Ayarlar</DialogTitle>
          <DialogDescription>
            Sistem davranışını, yapay zeka parametrelerini ve bildirimleri yapılandırın.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-[250px_1fr] overflow-hidden px-6 gap-8">
            <aside className="flex flex-col gap-2 pr-4 border-r border-white/10">
                {settingsNavItems.map(item => (
                    <Button 
                        key={item.id} 
                        variant="ghost" 
                        className={cn(
                            "justify-start text-base py-6",
                            activeSection === item.id && "bg-muted text-foreground"
                        )}
                        onClick={() => setActiveSection(item.id)}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                    </Button>
                ))}
            </aside>
            <main className="flex-grow overflow-y-auto space-y-8 pb-6 pr-2">
                {activeSection === 'ai' && (
                    <div className="space-y-8">
                        <Card className="bg-card/50 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg">Algılama Hassasiyeti</CardTitle>
                                <CardDescription>
                                    Bu değerin üzerindeki sapmalar "Anomali" olarak kabul edilecektir. Düşük değerler hassasiyeti artırır.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Slider
                                        id="anomaly-threshold"
                                        min={0.5}
                                        max={5.0}
                                        step={0.1}
                                        value={[currentSettings.anomalyThreshold]}
                                        onValueChange={(value) =>
                                            setCurrentSettings({ ...currentSettings, anomalyThreshold: value[0] })
                                        }
                                        className="flex-1"
                                    />
                                    <span className="w-28 rounded-md border text-center p-2 font-mono text-base bg-background/50 border-white/20">
                                        {currentSettings.anomalyThreshold.toFixed(1)} mm
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg">AI Kalibrasyonu</CardTitle>
                                <CardDescription>
                                    {isCalibrating
                                        ? "AI modeli, konveyör bandının mevcut durumunu yeni referans olarak ayarlıyor..."
                                        : "Sistemin sapmaları doğru tespit etmesi için, bantta fiziksel bir değişiklik yapıldığında AI'ı yeniden kalibre edin."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isCalibrating ? (
                                    <Progress value={calibrationProgress} className="w-full" />
                                ) : (
                                    <Button
                                        onClick={onCalibrate}
                                        disabled={isCalibrating}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        Kalibrasyonu Başlat
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {activeSection === 'stations' && (
                    <Card className="bg-card/50 border-white/10">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">İstasyon Yapılandırması</CardTitle>
                                    <CardDescription>
                                        Her bir konveyör bandı için video kaynağı tanımlayın.
                                    </CardDescription>
                                </div>
                                <Button variant="outline" onClick={handleScanNetwork} className="shrink-0">
                                    <Scan className="mr-2 h-4 w-4" />
                                    Ağı Tara
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground pb-4">
                                Video dosyası için yolu (örn: `/video.mp4`), cihaz kamerası için `webcam` anahtar kelimesini girin.
                            </p>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                {currentStations.map((station) => (
                                    <div key={station.id} className="grid grid-cols-12 items-center gap-2">
                                        <Input
                                            id={`station-${station.id}-name`}
                                            value={station.name}
                                            onChange={(e) => handleStationFieldChange(station.id, 'name', e.target.value)}
                                            className="col-span-4 bg-background/50"
                                            placeholder="İstasyon Adı"
                                        />
                                        <Input
                                            id={`station-${station.id}-source`}
                                            value={station.source}
                                            onChange={(e) => handleStationFieldChange(station.id, 'source', e.target.value)}
                                            className="col-span-7 bg-background/50"
                                            placeholder="Video Kaynağı (URL veya 'webcam')"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveStation(station.id)} className="col-span-1 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                             <Separator className="my-6" />
                             <Button variant="outline" onClick={handleAddStation} className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Yeni İstasyon Ekle
                            </Button>
                        </CardContent>
                    </Card>
                )}
                {activeSection === 'notifications' && (
                     <div className="space-y-8">
                        <Card className="bg-card/50 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg">Gerçek Zamanlı Uyarılar</CardTitle>
                                <CardDescription>
                                    Anomali durumlarında sistemin nasıl tepki vereceğini yönetin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4 border-white/10 bg-background/30">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="sound-alert" className="text-base">
                                            Sesli Uyarı
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Anomali tespit edildiğinde sesli bir uyarı çal.
                                        </p>
                                    </div>
                                    <Switch
                                        id="sound-alert"
                                        checked={currentSettings.isSoundAlertEnabled}
                                        onCheckedChange={handleSoundSwitchChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-white/10 opacity-60">
                            <CardHeader>
                                <CardTitle className="text-lg">Harici Bildirimler (Yakında)</CardTitle>
                                <CardDescription>
                                    Kritik anomalilerde tanımlı operatörlere harici bildirimler gönderin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4 border-dashed border-white/20 bg-transparent">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="email-alert" className="text-base">
                                            E-posta Bildirimi
                                        </Label>
                                    </div>
                                    <Switch id="email-alert" disabled />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4 border-dashed border-white/20 bg-transparent">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="sms-alert" className="text-base">
                                            SMS & WhatsApp
                                        </Label>
                                    </div>
                                    <Switch id="sms-alert" disabled />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {activeSection === 'operators' && (
                     <Card className="bg-card/50 border-white/10 h-full">
                        <CardContent className="h-full flex flex-col justify-center items-center text-center p-8 min-h-[300px]">
                            <div className="p-4 bg-muted/50 rounded-full mb-4 border border-dashed border-white/20">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Operatör Yönetimi</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">Bu özellik yakında eklenecektir. Bu bölümden, sisteme yeni operatörler ekleyebilecek, mevcutları yönetebilecek ve onlara özel bildirim atamaları yapabileceksiniz.</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-white/10 mt-auto">
            <Button variant="outline" onClick={() => setIsOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>Değişiklikleri Kaydet</Button>        
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
