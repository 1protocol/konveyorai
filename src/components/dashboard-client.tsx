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
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Video,
  Settings,
  BrainCircuit,
  Bell,
  Users,
  Camera,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SvgIcons } from "./ui/svg-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "./ui/input";

type AnomalyLog = {
  timestamp: Date;
  deviation: number;
};

export type AppSettings = {
  anomalyThreshold: number;
  isSoundAlertEnabled: boolean;
};

export type CameraConfig = {
  [key: string]: string;
};

export function DashboardClient() {
  const searchParams = useSearchParams();
  const selectedBant = searchParams.get('bant') || '1';

  const [settings, setSettings] = useState<AppSettings>({
    anomalyThreshold: 2.0,
    isSoundAlertEnabled: true,
  });
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>({
    '1': '/conveyor-video.mp4',
    '2': '/conveyor-video.mp4',
    '3': '/conveyor-video.mp4',
    '4': '/conveyor-video.mp4',
  });
  const [deviation, setDeviation] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "ANOMALİ" | "KALİBRE EDİLİYOR">(
    "NORMAL"
  );
  const [logs, setLogs] = useState<AnomalyLog[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const playAlertSound = useCallback(() => {
    if (settings.isSoundAlertEnabled && audioRef.current?.src) {
        audioRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
    }
  }, [settings.isSoundAlertEnabled]);

  useEffect(() => {
    setDeviation(0);
    setStatus("NORMAL");
    setLogs([]);
    setIsCalibrating(false);
    setCalibrationProgress(0);

    if(videoRef.current) {
      videoRef.current.src = cameraConfig[selectedBant] || '/conveyor-video.mp4';
      videoRef.current.load();
      videoRef.current.play().catch(e => console.error("Video oynatma hatası:", e));
    }

  }, [selectedBant, cameraConfig]);


  useEffect(() => {
    const analyzeFrame = async () => {
      if (isCalibrating || isProcessing || !videoRef.current || !canvasRef.current) return;
  
      setIsProcessing(true);
  
      const video = videoRef.current;
      if (video.paused || video.ended || video.readyState < 2) {
        setIsProcessing(false);
        return;
      }
      
      const canvas = canvasRef.current;
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
    
          if (newDeviation >= settings.anomalyThreshold) {
            if (status !== "ANOMALİ") {
              playAlertSound();
            }
            setStatus("ANOMALİ");
            setLogs((prevLogs) =>
              [{ timestamp: new Date(), deviation: newDeviation }, ...prevLogs].slice(0, 100)
            );
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
  }, [isCalibrating, isProcessing, toast, settings.anomalyThreshold, status, playAlertSound, selectedBant]);

  useEffect(() => {
    if (isCalibrating && calibrationProgress === 100) {
      toast({
        title: "Kalibrasyon Tamamlandı",
        description: `Bant ${selectedBant} için başlangıç referans verileri ayarlandı.`,
      });
    }
  }, [calibrationProgress, isCalibrating, toast, selectedBant]);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setStatus("KALİBRE EDİLİYOR");
    setCalibrationProgress(0);

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

  const isAnomaly = status === "ANOMALİ";

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Genel Bakış - Bant {selectedBant}</h1>
        <SettingsDialog 
          settings={settings} 
          onSettingsChange={setSettings} 
          audioRef={audioRef} 
          isCalibrating={isCalibrating}
          calibrationProgress={calibrationProgress}
          onCalibrate={handleCalibrate}
          cameraConfig={cameraConfig}
          onCameraConfigChange={setCameraConfig}
        />
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Video />
                Canlı İzleme - Bant {selectedBant}
            </CardTitle>
            <CardDescription>
                Yapay zeka, konveyör bandını kenar sapmaları için gerçek zamanlı olarak analiz eder.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative aspect-video w-full rounded-md bg-muted overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  playsInline 
                  loop
                  crossOrigin="anonymous"
                  key={selectedBant}
                />
                <canvas ref={canvasRef} className="hidden" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white font-medium">İşleniyor...</p>
                  </div>
                )}
                 <audio ref={audioRef} src="/alert-sound.mp3" preload="auto" onCanPlayThrough={() => {}} onError={(e) => console.error("Ses dosyası yüklenemedi", e)}></audio>
            </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className={cn(isAnomaly && "bg-destructive text-destructive-foreground")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
            {status === "NORMAL" && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            {status === "ANOMALİ" && (
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            )}
            {status === "KALİBRE EDİLİYOR" && (
              <SlidersHorizontal className="h-6 w-6 text-primary" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAnomaly ? "Anomali Tespit Edildi" : status}
            </div>
            <p
              className={cn(
                "text-xs",
                isAnomaly ? "text-destructive-foreground/80" : "text-muted-foreground"
              )}
            >
              {isAnomaly
                ? `Kayma ${settings.anomalyThreshold}mm eşiğini aşıyor.`
                : status === "NORMAL"
                ? "Konveyör bantları parametreler dahilinde çalışıyor."
                : "Referans değerler oluşturuluyor."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mevcut Sapma (AI)
            </CardTitle>
            <SvgIcons.ConveyorMovement className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                deviation >= settings.anomalyThreshold && "text-destructive"
              )}
            >
              {deviation.toFixed(2)} mm
            </div>
            <p className="text-xs text-muted-foreground">
              Yapay zeka destekli gerçek zamanlı ölçüm
            </p>
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anomali Kayıtları - Bant {selectedBant}</CardTitle>
          <CardDescription>
            AI tarafından tespit edilen anormal kayma örnekleri (sapma &ge; {settings.anomalyThreshold}mm).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Zaman Damgası</TableHead>
                  <TableHead className="text-right">Sapma (mm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{log.timestamp.toLocaleString('tr-TR')}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {log.deviation.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Henüz anomali kaydedilmedi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsDialog({
  settings,
  onSettingsChange,
  audioRef,
  isCalibrating,
  calibrationProgress,
  onCalibrate,
  cameraConfig,
  onCameraConfigChange,
}: {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isCalibrating: boolean;
  calibrationProgress: number;
  onCalibrate: () => void;
  cameraConfig: CameraConfig;
  onCameraConfigChange: (config: CameraConfig) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [currentCameraConfig, setCurrentCameraConfig] = useState(cameraConfig);


  useEffect(() => {
    setCurrentSettings(settings);
    setCurrentCameraConfig(cameraConfig);
  }, [settings, cameraConfig, isOpen]);

  const handleSave = () => {
    onSettingsChange(currentSettings);
    onCameraConfigChange(currentCameraConfig);
    setIsOpen(false);
  };
  
  const handleSoundSwitchChange = (checked: boolean) => {
    setCurrentSettings({ ...currentSettings, isSoundAlertEnabled: checked });
    if (checked && audioRef.current?.src) {
      // Ensure the audio is loaded before playing
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay was prevented. This is a common browser policy.
          // We can ignore this error in the context of a test sound.
          if (error.name !== "AbortError") {
             console.error("Test sesi çalma hatası:", error);
          }
        });
      }
    }
  };

  const handleCameraConfigFieldChange = (bant: string, value: string) => {
    setCurrentCameraConfig(prev => ({...prev, [bant]: value}));
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Gelişmiş Ayarlar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gelişmiş Ayarlar</DialogTitle>
          <DialogDescription>
            Sistem davranışını, yapay zeka parametrelerini ve bildirimleri yapılandırın.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ai-settings">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-settings"><BrainCircuit className="mr-2"/>Yapay Zeka</TabsTrigger>
            <TabsTrigger value="cameras"><Camera className="mr-2"/>Kameralar</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-2"/>Bildirimler</TabsTrigger>
            <TabsTrigger value="operators" disabled><Users className="mr-2"/>Operatörler</TabsTrigger>
          </TabsList>
          <TabsContent value="ai-settings" className="py-4">
            <div className="space-y-6">
                <div className="space-y-4 rounded-lg border p-4">
                  <Label htmlFor="anomaly-threshold" className="text-base">
                    Algılama Hassasiyeti (Anomali Eşiği)
                  </Label>
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
                    <span className="w-20 rounded-md border text-center p-2 font-mono text-sm">
                      {currentSettings.anomalyThreshold.toFixed(1)} mm
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bu değerin üzerindeki sapmalar "Anomali" olarak kabul edilecektir. Düşük değerler hassasiyeti artırır.
                  </p>
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <Label className="text-base">
                        AI Kalibrasyonu
                    </Label>
                     <p className="text-sm text-muted-foreground pb-2">
                        {isCalibrating
                            ? "AI modeli, konveyör bandının mevcut durumunu referans olarak ayarlıyor..."
                            : "Sistemin doğru çalışması için başlangıçta veya bantta fiziksel bir değişiklik yapıldığında AI'ı yeniden kalibre edin."}
                    </p>
                    {isCalibrating ? (
                    <Progress value={calibrationProgress} className="w-full" />
                    ) : (
                    <Button
                        onClick={onCalibrate}
                        disabled={isCalibrating}
                        className="w-full"
                    >
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Kalibrasyonu Başlat
                    </Button>
                    )}
                </div>
            </div>
          </TabsContent>
          <TabsContent value="cameras" className="py-4">
             <div className="space-y-4 rounded-lg border p-4">
                <Label className="text-base">
                    Kamera Yapılandırması
                </Label>
                <p className="text-sm text-muted-foreground">
                    Her bir konveyör bandı için video kaynağı URL'sini tanımlayın.
                </p>
                <div className="space-y-4 pt-2">
                    {Object.keys(currentCameraConfig).map((bant) => (
                         <div key={bant} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={`bant-${bant}-url`} className="text-right">
                                Bant {bant}
                            </Label>
                            <Input
                                id={`bant-${bant}-url`}
                                value={currentCameraConfig[bant]}
                                onChange={(e) => handleCameraConfigFieldChange(bant, e.target.value)}
                                className="col-span-3"
                                placeholder="örn: /video.mp4 veya http://192.168.1.10/stream"
                            />
                        </div>
                    ))}
                </div>
             </div>
          </TabsContent>
          <TabsContent value="notifications" className="py-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
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
            <div className="flex items-center justify-between rounded-lg border p-4 opacity-50">
              <div className="space-y-0.5">
                <Label htmlFor="email-alert" className="text-base">
                  E-posta Bildirimi (Yakında)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Kritik anomalilerde tanımlı operatörlere e-posta gönder.
                </p>
              </div>
              <Switch
                id="email-alert"
                disabled
              />
            </div>
            </div>
          </TabsContent>
           <TabsContent value="operators" className="py-4">
            <div className="text-center text-muted-foreground p-8">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold">Operatör Yönetimi</h3>
              <p className="text-sm">Bu özellik yakında eklenecektir. Operatörleri tanımlayıp, bildirim atamaları yapabileceksiniz.</p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>Değişiklikleri Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
