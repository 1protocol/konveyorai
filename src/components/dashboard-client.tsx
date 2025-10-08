

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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Video,
  BrainCircuit,
  Users,
  Loader,
  VideoOff,
  Scan,
  PlusCircle,
  Trash2,
  AreaChart,
  Network,
  Info,
  Pencil,
} from "@/components/ui/lucide-icons";
import { analyzeConveyorBelt } from "@/ai/flows/analyze-conveyor-flow";
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

export type Operator = {
  id: string;
  name: string;
  email: string;
};

interface DashboardClientProps {
  stations: Station[];
  settings: AppSettings;
  onStationsChange: (stations: Station[]) => void;
  onSettingsChange: (settings: AppSettings) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function DashboardClient({ 
  stations,
  settings,
  onStationsChange,
  onSettingsChange,
  audioRef,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const selectedStationId = searchParams.get('station') || (stations.length > 0 ? stations[0].id : null);
  const selectedStation = stations.find(s => s.id === selectedStationId) || (stations.length > 0 ? stations[0] : null);

  const [isClient, setIsClient] = useState(false);
  const [deviation, setDeviation] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "ANOMALİ" | "KALİBRE EDİLİYOR">(
    "NORMAL"
  );
  const [logs, setLogs] = useState<AnomalyLog[]>([]);
  const [deviationData, setDeviationData] = useState<DeviationData[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [calibratingStationId, setCalibratingStationId] = useState<string | null>(null);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState<Partial<Station>[]>([]);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newStationName, setNewStationName] = useState("");
  const [newStationSource, setNewStationSource] = useState("");
  
  const videoSource = selectedStation?.source || '/conveyor-video.mp4';
  const isWebcam = videoSource === 'webcam';
  const isAnomaly = status === "ANOMALİ";
  const isCalibrating = calibratingStationId === selectedStationId;


  useEffect(() => {
    setIsClient(true);
  }, []);

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
    if (calibratingStationId === selectedStationId) {
      setStatus("KALİBRE EDİLİYOR");
    } else if (status === "KALİBRE EDİLİYOR") {
      setStatus("NORMAL");
    }
  }, [calibratingStationId, selectedStationId, status]);


  useEffect(() => {
    const analyzeFrame = async () => {
      if (calibratingStationId || isProcessing || !videoRef.current || !captureCanvasRef.current || !selectedStation) return;
  
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
  }, [calibratingStationId, isProcessing, toast, settings.anomalyThreshold, status, playAlertSound, selectedStation, logs, saveLogs, isWebcam, hasCameraPermission]);

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

        if (isCalibrating) {
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
}, [deviation, isAnomaly, isCalibrating]);
  
  const filteredLogs = selectedStationId ? logs.filter(log => log.stationId === selectedStationId) : [];

  const handleStationFieldChange = (id: string, field: 'name' | 'source', value: string) => {
    const updatedStations = stations.map(station => station.id === id ? {...station, [field]: value} : station)
    onStationsChange(updatedStations);
  };
  
  const handleRemoveStation = (id: string) => {
    if (stations.length <= 1) {
      toast({ variant: 'destructive', title: 'Son İstasyon Silinemez', description: 'Sistemde en az bir istasyon bulunmalıdır.' });
      return;
    }
    const updatedStations = stations.filter(station => station.id !== id);
    onStationsChange(updatedStations);
    toast({ title: "İstasyon Silindi", description: "İstasyon başarıyla kaldırıldı."});
  };

  const handleScanNetwork = () => {
    setIsScanning(true);
    setDiscoveredCameras([]);
    setTimeout(() => {
        setDiscoveredCameras([
            { id: 'cam-1', name: 'Kamera - Üretim Hattı 1', source: 'rtsp://192.168.1.101/stream1' },
            { id: 'cam-2', name: 'Kamera - Paketleme Alanı', source: 'http://192.168.1.102/video.mjpg' },
            { id: 'cam-3', name: 'Depo Giriş Kamerası', source: 'rtsp://192.168.1.103/stream' },
        ]);
        setIsScanning(false);
    }, 2500);
  };
  
  const addDiscoveredCamera = (camera: Partial<Station>) => {
    const newStation: Station = {
        id: (Date.now() + Math.random()).toString(36),
        name: camera.name || `Yeni İstasyon`,
        source: camera.source || ''
    };
    onStationsChange([...stations, newStation]);
    toast({ title: "İstasyon Eklendi", description: `"${newStation.name}" ağdan eklendi.` });
  };
  
  const handleManualAddStation = () => {
   if(!newStationName || !newStationSource) {
       toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen istasyon adı ve kaynağını girin.' });
       return;
   }
   const newStation: Station = { id: (Date.now() + Math.random()).toString(36), name: newStationName, source: newStationSource };
   onStationsChange([...stations, newStation]);
   toast({ title: "İstasyon Eklendi", description: `"${newStationName}" manuel olarak eklendi.` });
   setNewStationName("");
   setNewStationSource("");
   setOpenAddDialog(false);
  };

  const handleStartCalibration = () => {
    if (!selectedStation) return;
    setCalibratingStationId(selectedStation.id);
    setCalibrationProgress(0);
    const progressInterval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCalibratingStationId(null);
          toast({ title: "Kalibrasyon Tamamlandı", description: `${selectedStation.name} başarıyla kalibre edildi.` });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
          
            <Tabs defaultValue="data" className="w-full">
                <TabsList>
                    <TabsTrigger value="data"><AreaChart className="mr-2"/>Canlı Veri</TabsTrigger>
                    <TabsTrigger value="station-settings"><Network className="mr-2"/>İstasyon Ayarları</TabsTrigger>
                    <TabsTrigger value="ai-config"><BrainCircuit className="mr-2"/>AI Yapılandırması</TabsTrigger>
                </TabsList>
                <TabsContent value="data" className="space-y-6 lg:space-y-8 mt-6">
                     <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AreaChart />Gerçek Zamanlı Sapma Grafiği (mm)</CardTitle></CardHeader>
                        <CardContent className="h-60 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={deviationData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background) / 0.8)', borderColor: 'hsl(var(--border))', backdropFilter: 'blur(4px)' }} labelStyle={{color: 'hsl(var(--foreground))'}}/>
                                    <Line type="monotone" dataKey="deviation" stroke={isAnomaly ? "hsl(var(--destructive))" : "hsl(var(--ring))"} strokeWidth={2} dot={false} isAnimationActive={false}/>
                                    <ReferenceLine y={settings.anomalyThreshold} label={{ value: 'Eşik', position: 'insideTopLeft', fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="station-settings" className="mt-6">
                    <Card className="bg-card/50 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg">İstasyon Yapılandırması</CardTitle>
                            <CardDescription>Mevcut istasyonları yönetin veya ağdaki kameraları tarayarak ya da manuel olarak yenilerini ekleyin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-lg border bg-background/30 border-white/10">
                                <p className="text-sm text-muted-foreground flex items-start gap-2">
                                    <Info className="w-8 h-8 shrink-0 mt-0.5" />
                                    <span>Sisteme çeşitli video kaynakları ekleyebilirsiniz: <strong>Cihaz Kamerası (USB/Dahili)</strong> için `webcam`, <strong>IP Kamera (CCTV)</strong> için `rtsp://` veya `http://` ile başlayan tam akış adresini, <strong>Video Dosyası</strong> için ise projenin `public` klasöründeki dosya yolunu (örn: `/video.mp4`) kullanın.</span>
                                </p>
                            </div>
                            <div className="space-y-4 max-h-[25rem] overflow-y-auto pr-2 -mr-4">
                                {stations.map((station) => (
                                    <div key={station.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-background/20">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                                            <Input value={station.name} onChange={(e) => handleStationFieldChange(station.id, 'name', e.target.value)} className="bg-background/70" placeholder="İstasyon Adı"/>
                                            <Input value={station.source} onChange={(e) => handleStationFieldChange(station.id, 'source', e.target.value)} className="bg-background/70" placeholder="Video Kaynağı"/>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveStation(station.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Dialog><DialogTrigger asChild><Button variant="outline" className="w-full"><Scan className="mr-2 h-4 w-4" />Ağı Tara</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Ağdaki Kameraları Tara</DialogTitle><DialogDescription>Yerel ağdaki potansiyel video kaynaklarını bulmak için taramayı başlatın.</DialogDescription></DialogHeader>
                                        <div className="py-4 space-y-4">
                                            {isScanning ? <div className="flex flex-col items-center justify-center space-y-2 h-40"><Loader className="w-8 h-8 animate-spin text-primary"/><p className="text-muted-foreground">Ağ taranıyor, lütfen bekleyin...</p></div>
                                            : discoveredCameras.length > 0 ? <div className="space-y-2 max-h-64 overflow-y-auto">{discoveredCameras.map((cam, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"><div><p className="font-semibold">{cam.name}</p><p className="text-xs text-muted-foreground">{cam.source}</p></div><Button size="sm" variant="secondary" onClick={() => addDiscoveredCamera(cam)}>Ekle</Button></div>)}</div>
                                            : <div className="flex flex-col items-center justify-center space-y-2 h-40 text-center"><Network className="w-8 h-8 text-muted-foreground"/><p className="text-muted-foreground">Başlamak için ağı tarayın.</p><p className="text-xs text-muted-foreground/70">(Bu özellik şu an için simülasyon amaçlıdır)</p></div>}
                                        </div>
                                        <DialogFooter><Button onClick={handleScanNetwork} disabled={isScanning}>{isScanning ? 'Taranıyor...' : 'Yeniden Tara'}</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}><DialogTrigger asChild><Button variant="outline" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Manuel Ekle</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Manuel İstasyon Ekle</DialogTitle><DialogDescription>Yeni bir istasyon için gerekli bilgileri girin.</DialogDescription></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="station-name" className="text-right">İstasyon Adı</Label><Input id="station-name" value={newStationName} onChange={(e) => setNewStationName(e.target.value)} className="col-span-3" placeholder="Örn: Bant 3 - Kesim Alanı"/></div>
                                            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="station-source" className="text-right">Video Kaynağı</Label><Input id="station-source" value={newStationSource} onChange={(e) => setNewStationSource(e.target.value)} className="col-span-3" placeholder="webcam, /video.mp4, rtsp://..."/></div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="secondary">İptal</Button></DialogClose>
                                            <Button onClick={handleManualAddStation} disabled={!newStationName || !newStationSource}>İstasyonu Ekle</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ai-config" className="mt-6">
                    <div className="space-y-8">
                        <Card className="bg-card/50 border-white/10">
                            <CardHeader><CardTitle className="text-lg">Algılama Hassasiyeti</CardTitle><CardDescription>Bu değerin üzerindeki sapmalar "Anomali" olarak kabul edilecektir. Düşük değerler hassasiyeti artırır.</CardDescription></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Slider id="anomaly-threshold" min={0.5} max={5.0} step={0.1} value={[settings.anomalyThreshold]} onValueChange={(value) => onSettingsChange({ ...settings, anomalyThreshold: value[0] })} className="flex-1"/>
                                    <span className="w-28 rounded-md border text-center p-2 font-mono text-base bg-background/50 border-white/20">{settings.anomalyThreshold.toFixed(1)} mm</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-white/10">
                            <CardHeader><CardTitle className="text-lg">AI Kalibrasyonu</CardTitle><CardDescription>Sistemin sapmaları doğru tespit etmesi için, bantta fiziksel bir değişiklik yapıldığında AI'ı yeniden kalibre edin.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                {isCalibrating ? (
                                   <div><p className="text-sm text-center text-muted-foreground mb-2">{selectedStation?.name || 'İstasyon'} kalibre ediliyor...</p><Progress value={calibrationProgress} className="w-full" /></div>
                                ) : (<Button onClick={handleStartCalibration} disabled={!!calibratingStationId} className="w-full" variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" />Kalibrasyonu Başlat</Button>)}
                            </CardContent>
                        </Card>
                         <Card className="bg-card/50 border-white/10">
                            <CardHeader><CardTitle className="text-lg">Gerçek Zamanlı Uyarılar</CardTitle><CardDescription>Anomali durumlarında sistemin nasıl tepki vereceğini yönetin.</CardDescription></CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg border p-4 border-white/10 bg-background/30">
                                    <div className="space-y-0.5"><Label htmlFor="sound-alert" className="text-base">Sesli Uyarı</Label><p className="text-sm text-muted-foreground">Anomali tespit edildiğinde sesli bir uyarı çal.</p></div>
                                    <Switch id="sound-alert" checked={settings.isSoundAlertEnabled} onCheckedChange={(checked) => onSettingsChange({ ...settings, isSoundAlertEnabled: checked })}/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:gap-8">
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
            <Card className="transition-all duration-300 bg-card/60 backdrop-blur-lg border border-white/10 hover:border-accent/50">
                <CardHeader>
                <CardTitle>Anomali Kayıtları</CardTitle>
                <CardDescription>
                    Son tespit edilen anomaliler
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
      </div>
    </div>
  );
}


interface SettingsContentProps {
    activeSection: string;
    operators: Operator[];
    onOperatorsChange: (operators: Operator[]) => void;
}

export function SettingsContent({
  activeSection,
  operators,
  onOperatorsChange,
}: SettingsContentProps) {
  const [currentOperators, setCurrentOperators] = useState(operators);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [currentOperator, setCurrentOperator] = useState<Partial<Operator>>({});

  const { toast } = useToast();

  useEffect(() => {
    setCurrentOperators(operators);
  }, [operators]);

  const handleAddNew = () => {
    setCurrentOperator({});
    setIsEditing(null);
    setOpenAddDialog(true);
  };
  
  const handleEdit = (operator: Operator) => {
    setCurrentOperator(operator);
    setIsEditing(operator.id);
    setOpenAddDialog(true);
  };

  const handleDelete = (id: string) => {
    const updatedOperators = currentOperators.filter(op => op.id !== id);
    // No need to call setCurrentOperators here as it will be updated by parent
    onOperatorsChange(updatedOperators);
    toast({
        title: "Operatör Silindi",
        description: "Operatör başarıyla listeden kaldırıldı.",
    });
  };
  
  const handleSaveOperator = () => {
    if (!currentOperator.name || !currentOperator.email) {
      toast({ variant: 'destructive', title: 'Eksik Bilgi', description: 'Lütfen operatör adı ve e-posta adresini girin.' });
      return;
    }
    
    let updatedOperators;
    if (isEditing) {
      updatedOperators = currentOperators.map(op => op.id === isEditing ? {...op, ...currentOperator} as Operator : op);
    } else {
      const newOperator: Operator = {
        id: (Date.now() + Math.random()).toString(36),
        name: currentOperator.name,
        email: currentOperator.email,
      };
      updatedOperators = [...currentOperators, newOperator];
    }
    
    onOperatorsChange(updatedOperators);
    setOpenAddDialog(false);
    setIsEditing(null);
    setCurrentOperator({});
  };

  const handleCloseDialog = (isOpen: boolean) => {
    if (!isOpen) {
        setIsEditing(null);
        setCurrentOperator({});
    }
    setOpenAddDialog(isOpen);
  }


  return (
     <div className="space-y-8 max-w-4xl mx-auto">
        {activeSection === 'operators' && (
             <Card className="bg-card/50 border-white/10 h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">Operatör Yönetimi</CardTitle>
                            <CardDescription>
                                Sisteme yeni operatörler ekleyin, mevcutları düzenleyin ve yönetin.
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleAddNew} className="shrink-0">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Yeni Operatör Ekle
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>İsim</TableHead>
                                <TableHead>E-posta</TableHead>
                                <TableHead className="text-right">Eylemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentOperators.length > 0 ? (
                                currentOperators.map(op => (
                                    <TableRow key={op.id}>
                                        <TableCell className="font-medium">{op.name}</TableCell>
                                        <TableCell>{op.email}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(op)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive/80 hover:text-destructive" onClick={() => handleDelete(op.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Henüz operatör eklenmemiş.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}

        <Dialog open={openAddDialog} onOpenChange={handleCloseDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Operatörü Düzenle' : 'Yeni Operatör Ekle'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="op-name" className="text-right">İsim</Label>
                        <Input id="op-name" value={currentOperator.name || ''} onChange={(e) => setCurrentOperator({...currentOperator, name: e.target.value})} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="op-email" className="text-right">E-posta</Label>
                        <Input id="op-email" type="email" value={currentOperator.email || ''} onChange={(e) => setCurrentOperator({...currentOperator, email: e.target.value})} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleCloseDialog(false)}>İptal</Button>
                    <Button onClick={handleSaveOperator}>{isEditing ? 'Değişiklikleri Kaydet' : 'Operatör Ekle'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
