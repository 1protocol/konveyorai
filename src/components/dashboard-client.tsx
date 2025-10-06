

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Loader,
  VideoOff,
  Scan,
  AreaChart,
  PlusCircle,
  Trash2
} from "@/components/ui/lucide-icons";
import { analyzeConveyorBelt } from "@/ai/flows/analyze-conveyor-flow";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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

interface DashboardClientProps {
  stations: Station[];
  settings: AppSettings;
  onStationsChange: (stations: Station[]) => void;
  onSettingsChange: (settings: AppSettings) => void;
  calibratingStationId: string | null;
  calibrationProgress: number;
  onCalibrate: (stationId: string) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function DashboardClient({ 
  stations, 
  settings, 
  onStationsChange,
  onSettingsChange,
  calibratingStationId,
  calibrationProgress,
  onCalibrate,
  audioRef
}: DashboardClientProps) {
  const searchParams = useSearchParams();
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
  const [isAddStationDialogOpen, setIsAddStationDialogOpen] = useState(false);


  const videoSource = selectedStation?.source || '/conveyor-video.mp4';
  const isWebcam = videoSource === 'webcam';
  const isAnomaly = status === "ANOMALİ";
  const isCalibrating = calibratingStationId === selectedStationId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  useEffect(() => {
    setCurrentStations(stations);
  }, [stations]);

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
    if (settings.isSoundAlertEnabled && audioRef.current) {
        if (audioRef.current.src && !audioRef.current.src.endsWith('null')) {
            audioRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
        }
    }
  }, [settings.isSoundAlertEnabled, audioRef]);

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
             if (status === "ANOMALİ") {
                setStatus("NORMAL");
             }
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
  
  const handleSave = () => {
    onSettingsChange(currentSettings);
    onStationsChange(currentStations);
    toast({
        title: "Ayarlar Kaydedildi",
        description: "Yeni yapılandırmanız başarıyla kaydedildi.",
    });
  };

  const handleStationFieldChange = (id: string, field: 'name' | 'source', value: string) => {
    setCurrentStations(prev => 
      prev.map(station => station.id === id ? {...station, [field]: value} : station)
    );
  };

  const handleAddStation = (station: Omit<Station, 'id'>) => {
    const newId = (Date.now() + Math.random()).toString(36);
    const newStation: Station = {
        id: newId,
        ...station
    };
    const updatedStations = [...currentStations, newStation];
    setCurrentStations(updatedStations);
    onStationsChange(updatedStations);
    toast({
        title: "İstasyon Eklendi",
        description: `${newStation.name} başarıyla eklendi.`,
    });
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
     const updatedStations = currentStations.filter(station => station.id !== id);
    setCurrentStations(updatedStations);
    onStationsChange(updatedStations);
  };


  if (!isClient || !selectedStation) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  const filteredLogs = selectedStationId ? logs.filter(log => log.stationId === selectedStationId) : [];

  return (
    <div className="space-y-6 lg:space-y-8 w-full overflow-x-hidden">
       <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          İstasyon: {selectedStation.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
        </div>

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
        </div>
      </div>
      
      <Tabs defaultValue="live-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-data">Canlı Veri</TabsTrigger>
          <TabsTrigger value="station-settings">İstasyon Ayarları</TabsTrigger>
          <TabsTrigger value="ai-config">AI Yapılandırması</TabsTrigger>
        </TabsList>
        <TabsContent value="live-data" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50">
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
                                <ReferenceLine y={settings.anomalyThreshold} label={{ value: 'Eşik', position: 'insideTopLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50">
                    <CardHeader>
                    <CardTitle>Anomali Kayıtları</CardTitle>
                    <CardDescription>
                        Bu istasyonda son tespit edilen anomaliler
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="relative max-h-[calc(100vh-42rem)] overflow-y-auto">
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
        <TabsContent value="station-settings" className="mt-6">
            <Card className="bg-card/50 border-white/10 max-w-4xl mx-auto">
                <CardHeader>
                     <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>İstasyon Yönetimi</CardTitle>
                            <CardDescription>
                                Mevcut istasyonları düzenleyin veya ağınızdaki yeni kameraları tarayarak ekleyin.
                            </CardDescription>
                        </div>
                        <AddStationDialog onAddStation={handleAddStation}>
                             <Button variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Yeni İstasyon Ekle
                            </Button>
                        </AddStationDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-4 max-h-80 overflow-y-auto pr-2 border rounded-md p-4">
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
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave}>İstasyonları Kaydet</Button>   
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="ai-config" className="mt-6">
             <Card className="bg-card/50 border-white/10 max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>AI Yapılandırması ve Kalibrasyon</CardTitle>
                    <CardDescription>
                        Bu istasyon için yapay zeka hassasiyetini ayarlayın ve gerekirse yeniden kalibre edin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <Label>Algılama Hassasiyeti (Anomali Eşiği)</Label>
                        <p className="text-sm text-muted-foreground pb-2">
                            Bu değerin üzerindeki sapmalar "Anomali" olarak kabul edilecektir. Düşük değerler hassasiyeti artırır.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
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
                    </div>
                    <div>
                        <Label>AI Kalibrasyonu</Label>
                         <p className="text-sm text-muted-foreground pb-2">
                            Sistemin sapmaları doğru tespit etmesi için, bantta fiziksel bir değişiklik yapıldığında AI'ı yeniden kalibre edin.
                        </p>
                       <div className="pt-2">
                        {isCalibrating ? (
                                <Progress value={calibrationProgress} className="w-full" />
                            ) : (
                                <Button
                                    onClick={() => onCalibrate(selectedStation.id)}
                                    disabled={!!calibratingStationId}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Bu İstasyon İçin Kalibrasyonu Başlat
                                </Button>
                            )}
                        </div>
                    </div>
                     <Separator />
                     <div className="flex justify-end">
                        <Button onClick={handleSave}>AI Ayarlarını Kaydet</Button>   
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function AddStationDialog({ children, onAddStation }: { children: React.ReactNode; onAddStation: (station: Omit<Station, 'id'>) => void; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState<Omit<Station, 'id'>[]>([]);
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const { toast } = useToast();

  const handleScanNetwork = () => {
    setIsScanning(true);
    setDiscoveredCameras([]);
    setTimeout(() => {
      setDiscoveredCameras([
        { name: 'Kamera - Üretim Hattı 1', source: 'rtsp://192.168.1.101/stream1' },
        { name: 'Kamera - Paketleme Alanı', source: 'rtsp://192.168.1.102/stream1' },
        { name: 'Depo Giriş Kamerası', source: 'rtsp://192.168.1.103/stream1' },
      ]);
      setIsScanning(false);
      toast({
        title: "Tarama Tamamlandı",
        description: "Ağda 3 yeni potansiyel kamera bulundu.",
      });
    }, 2500);
  };

  const handleAddDiscovered = (camera: Omit<Station, 'id'>) => {
    onAddStation(camera);
    setIsOpen(false);
  };
  
  const handleAddManual = () => {
      if(!name || !source) {
          toast({
              variant: 'destructive',
              title: 'Eksik Bilgi',
              description: 'Lütfen istasyon adı ve kaynağı alanlarını doldurun.',
          });
          return;
      }
      onAddStation({ name, source });
      setName("");
      setSource("");
      setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni İstasyon Ekle</DialogTitle>
          <DialogDescription>
            Ağı tarayarak yeni kameralar bulun veya video kaynağını manuel olarak ekleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Manuel Ekle</h4>
                <div className="space-y-2">
                    <Label htmlFor="station-name">İstasyon Adı</Label>
                    <Input id="station-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bant 3" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="station-source">Video Kaynağı</Label>
                    <Input id="station-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="/video.mp4 veya webcam" />
                </div>
                 <Button onClick={handleAddManual} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Manuel Olarak Ekle
                </Button>
            </div>
             <div className="space-y-4">
                 <h4 className="font-semibold text-foreground">Otomatik Bul</h4>
                 <Button onClick={handleScanNetwork} disabled={isScanning} className="w-full" variant="outline">
                    {isScanning ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Scan className="mr-2 h-4 w-4" />}
                    {isScanning ? 'Ağ Taranıyor...' : 'Ağı Tara'}
                 </Button>
                 <div className="space-y-2 pt-2 min-h-[140px]">
                     {isScanning && (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                            <span>Kameralar aranıyor...</span>
                         </div>
                     )}
                     {!isScanning && discoveredCameras.length === 0 && (
                          <div className="flex items-center justify-center h-full text-center text-muted-foreground text-sm p-4 border border-dashed rounded-md">
                            Ağdaki kameraları bulmak için taramayı başlatın.
                         </div>
                     )}
                     {discoveredCameras.length > 0 && (
                         <div className="space-y-2">
                             {discoveredCameras.map((cam, index) => (
                                 <div key={index} className="flex items-center justify-between gap-2 p-2 border rounded-md bg-background/50">
                                    <div className="truncate">
                                        <p className="font-medium text-sm truncate">{cam.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{cam.source}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleAddDiscovered(cam)}>Ekle</Button>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

    