"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

type AnomalyLog = {
  timestamp: Date;
  deviation: number;
};

export type AppSettings = {
  anomalyThreshold: number;
  isSoundAlertEnabled: boolean;
};

export function DashboardClient() {
  const [settings, setSettings] = useState<AppSettings>({
    anomalyThreshold: 2.0,
    isSoundAlertEnabled: true,
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
    if (settings.isSoundAlertEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Ses çalma hatası:", e));
    }
  }, [settings.isSoundAlertEnabled]);

  useEffect(() => {
    const analyzeFrame = async () => {
      if (isCalibrating || isProcessing || !videoRef.current || !canvasRef.current) return;
  
      setIsProcessing(true);
  
      const video = videoRef.current;
      if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) {
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
  }, [isCalibrating, isProcessing, toast, settings.anomalyThreshold, status, playAlertSound]);

  useEffect(() => {
    if (isCalibrating && calibrationProgress === 100) {
      toast({
        title: "Kalibrasyon Tamamlandı",
        description: "Başlangıç referans verileri ayarlandı.",
      });
    }
  }, [calibrationProgress, isCalibrating, toast]);

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
        <h1 className="text-2xl font-bold tracking-tight">Genel Bakış</h1>
        <SettingsDialog settings={settings} onSettingsChange={setSettings} audioRef={audioRef} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Video />
                Canlı İzleme
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
                  src="/conveyor-video.mp4" 
                  crossOrigin="anonymous"
                />
                <canvas ref={canvasRef} className="hidden" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white font-medium">İşleniyor...</p>
                  </div>
                )}
                 <audio ref={audioRef} src="/alert-sound.mp3" preload="auto"></audio>
            </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="m6 9 6-6 6 6" />
              <path d="M12 3v13.5" />
              <path d="m6 9 6 6 6-6" />
            </svg>
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

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">
              AI Kalibrasyonu
            </CardTitle>
            <CardDescription className="text-xs">
              {isCalibrating
                ? "AI modeli kalibre ediliyor..."
                : "Yeni referans noktaları için AI'ı yeniden kalibre edin."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCalibrating ? (
              <Progress value={calibrationProgress} className="w-full" />
            ) : (
              <Button
                onClick={handleCalibrate}
                disabled={isCalibrating}
                className="w-full"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                AI Kalibrasyonunu Başlat
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anomali Kayıtları</CardTitle>
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
}: {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(settings);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    onSettingsChange(currentSettings);
    setIsOpen(false);
  };
  
  const handleSoundSwitchChange = (checked: boolean) => {
    setCurrentSettings({ ...currentSettings, isSoundAlertEnabled: checked });
    if (checked && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Test sesi çalma hatası:", e));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2" />
          Ayarlar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gelişmiş Ayarlar</DialogTitle>
          <DialogDescription>
            Yapay zeka ve bildirim ayarlarını buradan yapılandırın.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <Label htmlFor="anomaly-threshold" className="text-base">
              Anomali Eşiği (mm)
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
              <span className="w-16 rounded-md border text-center p-2 font-mono text-sm">
                {currentSettings.anomalyThreshold.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Bu değerin üzerindeki sapmalar "Anomali" olarak kabul edilecektir.
            </p>
          </div>
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
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Değişiklikleri Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
