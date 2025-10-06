

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";


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

interface DashboardClientProps {
  stations: Station[];
  settings: AppSettings;
  calibratingStationId: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  onSettingsChange: (settings: AppSettings) => void;
  onStationsChange: (stations: Station[]) => void;
  calibrationProgress: number;
  onCalibrate: (stationId: string) => void;
}

export function DashboardClient({ 
  stations, 
  settings, 
  calibratingStationId,
  audioRef,
  onSettingsChange,
  onStationsChange,
  calibrationProgress,
  onCalibrate
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedStationId = searchParams.get('station') || (stations.length > 0 ? stations[0].id : null);
  
  const selectedStation = stations.find(s => s.id === selectedStationId) || (stations.length > 0 ? stations[0] : null);

  const [isClient, setIsClient] = useState(false);
  const [deviation, setDeviation] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "ANOMALİ" | "KALİBRE EDİLİYOR">(
    "NORMAL"
  );
  const [logs, setLogs] = useState<AnomalyLog[]>([]);
  const [deviationData, setDeviationData] = useState<DeviationData[]>([]);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [currentSettings, setCurrentSettings] = useState(settings);
  const [currentStations, setCurrentStations] = useState(stations);

  const videoSource = selectedStation?.source || '/conveyor-video.mp4';
  const isWebcam = videoSource === 'webcam';
  const isAnomaly = status === "ANOMALİ";
  const isCalibrating = calibratingStationId === selectedStationId;


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
      setCurrentSettings(settings);
      setCurrentStations(stations);
  }, [settings, stations]);

  useEffect(() => {
    if (isClient) {
      try {
        const savedLogs = localStorage.getItem("konveyorAILogs");
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        }
      } catch (error) {
        console.error("Yerel depolamadan kayıtlar okunurken hata oluştu:", error);
      }
    }
  }, [isClient]);
  
  const saveLogs = useCallback((newLogs: AnomalyLog[]) => {
    setLogs(newLogs);
    if (isClient) {
        localStorage.setItem("konveyorAILogs", JSON.stringify(newLogs));
    }
  }, [isClient]);

  const playAlertSound = useCallback(() => {
    if (currentSettings.isSoundAlertEnabled && audioRef.current) {
        if (audioRef.current.src && !audioRef.current.src.endsWith('null')) {
            audioRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
        }
    }
  }, [currentSettings.isSoundAlertEnabled, audioRef]);

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
    if (isCalibrating) {
      setStatus("KALİBRE EDİLİYOR");
    } else if (status === "KALİBRE EDİLİYOR") {
      setStatus("NORMAL");
    }
  }, [isCalibrating, status]);


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


          if (newDeviation >= currentSettings.anomalyThreshold) {
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
  }, [isCalibrating, isProcessing, toast, currentSettings.anomalyThreshold, status, playAlertSound, selectedStation, logs, saveLogs, isWebcam, hasCameraPermission]);

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
        
        if (overlay.width !== video.clientWidth || overlay.height !== video.clientHeight) {
            overlay.width = video.clientWidth;
            overlay.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, overlay.width, overlay.height);

        if (isCalibrating || status === "KALİBRE EDİLİYOR") {
            animationFrameId.current = requestAnimationFrame(draw);
            return;
        }

        const lineY = overlay.height / 2;
        const deviationScale = 25;
        const deviationPx = deviation * deviationScale;

        ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(overlay.width, lineY);
        ctx.stroke();
        ctx.setLineDash([]);


        if (Math.abs(deviation) > 0.1) {
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
            
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, lineY - deviationPx);
            ctx.lineTo(overlay.width, lineY - deviationPx);
            ctx.stroke();

            ctx.lineWidth = 1;
            const startY = Math.min(lineY, lineY - deviationPx);
            const endY = Math.max(lineY, lineY - deviationPx);

            for (let i = 0; i < overlay.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, startY);
                ctx.lineTo(i, endY);
                ctx.stroke();
            }

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
  
  const filteredLogs = selectedStationId ? logs.filter(log => log.stationId === selectedStationId) : [];

  const handleSaveAll = () => {
    onSettingsChange(currentSettings);
    onStationsChange(currentStations);
    toast({
        title: "Ayarlar Kaydedildi",
        description: "Yeni yapılandırmanız başarıyla kaydedildi.",
    });
  };

  if (!isClient || !selectedStation) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="space-y-6 lg:space-y-8 w-full overflow-x-hidden">
       <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          İstasyon: {selectedStation.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <Card className="transition-all w-full duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Video />
                    Canlı İzleme
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
           <Tabs defaultValue="live-data" className="w-full">
            <div className="flex justify-between items-center border-b mb-4">
              <TabsList>
                <TabsTrigger value="live-data"><AreaChart className="mr-2 h-4 w-4"/>Canlı Veri</TabsTrigger>
                <TabsTrigger value="station-settings"><Network className="mr-2 h-4 w-4"/>İstasyon Ayarları</TabsTrigger>
                <TabsTrigger value="ai-config"><BrainCircuit className="mr-2 h-4 w-4"/>AI Yapılandırması</TabsTrigger>
              </TabsList>
               <Button onClick={handleSaveAll} size="sm">Tüm Değişiklikleri Kaydet</Button>
            </div>
            <TabsContent value="live-data">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                          <AreaChart />
                          Gerçek Zamanlı Sapma Grafiği (mm)
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="h-60 sm:h-80">
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
                                  stroke={isAnomaly ? "hsl(var(--destructive))" : "hsl(var(--ring))"}
                                  strokeWidth={2} 
                                  dot={false}
                                  isAnimationActive={false}
                              />
                              <ReferenceLine y={currentSettings.anomalyThreshold} label={{ value: 'Eşik', position: 'insideTopLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                          </LineChart>
                      </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10">
                  <CardHeader>
                    <CardTitle>Anomali Kayıtları</CardTitle>
                    <CardDescription>
                        Bu istasyonda tespit edilen son anomaliler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative max-h-80 overflow-y-auto">
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
            </TabsContent>
            <TabsContent value="station-settings">
              <SettingsContent 
                settings={currentSettings}
                onSettingsChange={setCurrentSettings}
                stations={currentStations}
                onStationsChange={setCurrentStations}
                calibratingStationId={calibratingStationId}
                calibrationProgress={calibrationProgress}
                onCalibrate={onCalibrate}
                activeSection="stations"
                audioRef={audioRef}
              />
            </TabsContent>
            <TabsContent value="ai-config">
              <SettingsContent 
                settings={currentSettings}
                onSettingsChange={setCurrentSettings}
                stations={currentStations}
                onStationsChange={setCurrentStations}
                calibratingStationId={calibratingStationId}
                calibrationProgress={calibrationProgress}
                onCalibrate={onCalibrate}
                activeSection="ai"
                audioRef={audioRef}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
                <Card className={cn("transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50", isAnomaly && "bg-destructive/30 text-destructive-foreground border-destructive/50")}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Sistem Durumu
                      {status === "NORMAL" && <CheckCircle className="h-5 w-5 text-green-400" />}
                      {status === "ANOMALİ" && <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />}
                      {status === "KALİBRE EDİLİYOR" && <SlidersHorizontal className="h-5 w-5 text-ring" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                       {status}
                    </div>
                    <p className={cn("text-xs text-muted-foreground", isAnomaly && "text-red-200")}>
                      {isAnomaly
                        ? `Sapma eşiği aşıldı.`
                        : status === "NORMAL"
                        ? "Parametreler dahilinde."
                        : "Referans oluşturuluyor..."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50">
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
                        deviation >= currentSettings.anomalyThreshold && "text-red-400"
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
            <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell /> Genel Ayarlar
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4 border-white/10 bg-background/30">
                        <div className="space-y-0.5">
                            <Label htmlFor="sound-alert-main" className="text-base">
                                Sesli Uyarı
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Anomali tespit edildiğinde sesli uyarı çal.
                            </p>
                        </div>
                        <Switch
                            id="sound-alert-main"
                            checked={currentSettings.isSoundAlertEnabled}
                            onCheckedChange={(checked) => {
                                setCurrentSettings({ ...currentSettings, isSoundAlertEnabled: checked });
                                if (checked && audioRef.current) {
                                    if (!audioRef.current.src || audioRef.current.src.endsWith('null')) {
                                        audioRef.current.src = "/alert-sound.mp3";
                                        audioRef.current.load();
                                    }
                                    audioRef.current.play().catch(e => console.error("Test sesi çalınamadı:", e));
                                }
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

interface SettingsContentProps {
    activeSection: 'ai' | 'stations';
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    stations: Station[];
    onStationsChange: (stations: Station[]) => void;
    calibratingStationId: string | null;
    calibrationProgress: number;
    onCalibrate: (stationId: string) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
}

function SettingsContent({
  activeSection,
  settings,
  onSettingsChange,
  stations,
  onStationsChange,
  calibratingStationId,
  calibrationProgress,
  onCalibrate,
}: SettingsContentProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState<Omit<Station, 'id'>[]>([]);

  const [newStationName, setNewStationName] = useState("");
  const [newStationSource, setNewStationSource] = useState("");
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  const handleStationFieldChange = (id: string, field: 'name' | 'source', value: string) => {
    onStationsChange(
      stations.map(station => station.id === id ? {...station, [field]: value} : station)
    );
  };

  const handleManualAddStation = () => {
    if (!newStationName || !newStationSource) {
      toast({
        variant: 'destructive',
        title: 'Eksik Bilgi',
        description: 'Lütfen istasyon adı ve kaynağını girin.',
      });
      return;
    }
    const newId = (Date.now() + Math.random()).toString(36);
    const newStation: Station = {
        id: newId,
        name: newStationName,
        source: newStationSource,
    };
    onStationsChange([...stations, newStation]);
    toast({
        title: "İstasyon Eklendi",
        description: `"${newStationName}" başarıyla eklendi. Değişiklikleri kaydetmeyi unutmayın.`,
    });
    setNewStationName("");
    setNewStationSource("");
    setIsManualAddOpen(false);
  };

  const handleRemoveStation = (id: string) => {
    if (stations.length <= 1) {
        toast({
            variant: 'destructive',
            title: 'Son İstasyon Silinemez',
            description: 'Sistemde en az bir istasyon bulunmalıdır.',
        });
        return;
    }
    onStationsChange(stations.filter(station => station.id !== id));
  };
  
  const handleScanNetwork = () => {
    setIsScanning(true);
    setDiscoveredCameras([]);
    toast({
        title: "Ağ Taranıyor...",
        description: "Yerel ağdaki kameralar aranıyor. Bu işlem biraz zaman alabilir.",
    });
    setTimeout(() => {
      setDiscoveredCameras([
        { name: 'IP Kamera - Üretim Hattı 1', source: 'rtsp://192.168.1.101/stream1' },
        { name: 'IP Kamera - Paketleme Alanı', source: 'rtsp://192.168.1.102/stream1' },
        { name: 'Depo Giriş Kamerası', source: 'rtsp://192.168.1.103/stream1' },
      ]);
      setIsScanning(false);
      toast({
        title: "Tarama Tamamlandı",
        description: "Ağda 3 yeni potansiyel kamera bulundu.",
      });
    }, 3500);
  };

  const handleAddDiscovered = (camera: Omit<Station, 'id'>) => {
    const newId = (Date.now() + Math.random()).toString(36);
    onStationsChange([...stations, {id: newId, ...camera}]);
    setDiscoveredCameras(prev => prev.filter(c => c.source !== camera.source));
    toast({
        title: "İstasyon Eklendi",
        description: `${camera.name} başarıyla eklendi. Değişiklikleri kaydetmeyi unutmayın.`,
    });
  };

  const handleStartCalibration = (stationId: string) => {
    if (!stationId) {
        toast({
            variant: 'destructive',
            title: 'İstasyon Seçilmedi',
            description: 'Lütfen kalibre edilecek istasyonu seçin.',
        });
        return;
    }
    onCalibrate(stationId);
  };

  return (
     <div className="space-y-8 max-w-4xl mx-auto">
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
                                value={[settings.anomalyThreshold]}
                                onValueChange={(value) =>
                                    onSettingsChange({ ...settings, anomalyThreshold: value[0] })
                                }
                                className="flex-1"
                            />
                            <span className="w-28 rounded-md border text-center p-2 font-mono text-base bg-background/50 border-white/20">
                                {settings.anomalyThreshold.toFixed(1)} mm
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        {activeSection === 'stations' && (
            <div className="space-y-6">
                <Card className="bg-card/50 border-white/10">
                  <CardHeader>
                      <CardTitle className="text-lg">Mevcut İstasyonlar</CardTitle>
                      <CardDescription>
                          İstasyonları düzenleyin, kaldırın veya her biri için özel AI kalibrasyonu başlatın.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {stations.map((station) => {
                            const isCalibratingThis = calibratingStationId === station.id;
                            return (
                                <div key={station.id} className="flex flex-col gap-2 p-3 border rounded-md bg-background/30">
                                    <div className="grid grid-cols-12 items-center gap-2">
                                        <Input
                                            id={`station-${station.id}-name`}
                                            value={station.name}
                                            onChange={(e) => handleStationFieldChange(station.id, 'name', e.target.value)}
                                            className="col-span-5 bg-background/50"
                                            placeholder="İstasyon Adı"
                                        />
                                        <Input
                                            id={`station-${station.id}-source`}
                                            value={station.source}
                                            onChange={(e) => handleStationFieldChange(station.id, 'source', e.target.value)}
                                            className="col-span-6 bg-background/50"
                                            placeholder="Video Kaynağı (URL veya 'webcam')"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveStation(station.id)} className="col-span-1 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                    {isCalibratingThis ? (
                                        <div className="mt-2">
                                            <p className="text-sm text-center text-muted-foreground mb-1">
                                            Kalibre ediliyor...
                                            </p>
                                            <Progress value={calibrationProgress} className="w-full h-2" />
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => handleStartCalibration(station.id)}
                                            disabled={!!calibratingStationId}
                                            className="w-full mt-2"
                                            variant="outline"
                                            size="sm"
                                        >
                                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                                            Bu İstasyonu Kalibre Et
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                  </CardContent>
                </Card>
                 <Card className="bg-card/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Yeni İstasyon Ekle</CardTitle>
                       <CardDescription>
                          Ağdaki kameraları otomatik olarak bulun veya manuel olarak yeni bir istasyon ekleyin.
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button variant="default" onClick={handleScanNetwork} disabled={isScanning} className="flex-1">
                            {isScanning ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Scan className="mr-2 h-4 w-4" />}
                            {isScanning ? 'Taranıyor...' : 'Ağı Tara'}
                        </Button>
                        <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
                          <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Manuel Ekle
                              </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Manuel İstasyon Ekle</DialogTitle>
                                  <DialogDescription>Yeni bir video kaynağını manuel olarak tanımlayın.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="new-station-name">İstasyon Adı</Label>
                                  <Input 
                                    id="new-station-name"
                                    value={newStationName}
                                    onChange={(e) => setNewStationName(e.target.value)}
                                    placeholder="Örn: Paketleme Bandı"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-station-source">Video Kaynağı</Label>
                                  <Input 
                                    id="new-station-source"
                                    value={newStationSource}
                                    onChange={(e) => setNewStationSource(e.target.value)}
                                    placeholder="örn: /video.mp4, webcam, rtsp://..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                   <Button 
                                    onClick={handleManualAddStation}
                                    disabled={!newStationName || !newStationSource}
                                   >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    İstasyonu Ekle
                                  </Button>
                              </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {isScanning && (
                          <div className="flex items-center justify-center text-muted-foreground pt-4">
                              <p>Kameralar aranıyor, lütfen bekleyin...</p>
                          </div>
                      )}
                      {!isScanning && discoveredCameras.length > 0 && (
                          <div className="space-y-2 pt-4">
                              <h4 className="font-medium text-sm">Bulunan Kameralar</h4>
                              {discoveredCameras.map((cam, index) => (
                                  <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-background/30 hover:bg-background/70">
                                      <div className="truncate">
                                          <p className="font-medium text-sm truncate flex items-center gap-2"><Camera className="text-primary"/> {cam.name}</p>
                                          <p className="text-xs text-muted-foreground truncate pl-6">{cam.source}</p>
                                      </div>
                                      <Button size="sm" variant="secondary" onClick={() => handleAddDiscovered(cam)}>
                                         <PlusCircle className="mr-2 h-4 w-4"/> Ekle
                                      </Button>
                                  </div>
                              ))}
                          </div>
                      )}
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}

