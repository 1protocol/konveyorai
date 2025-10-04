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
  Loader,
  VideoOff,
  Scan,
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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type AnomalyLog = {
  timestamp: string; // Use string to ensure serializability for localStorage
  deviation: number;
  bant: string;
};

export type AppSettings = {
  anomalyThreshold: number;
  isSoundAlertEnabled: boolean;
};

export type CameraConfig = {
  [key: string]: string;
};

const defaultSettings: AppSettings = {
  anomalyThreshold: 2.0,
  isSoundAlertEnabled: true,
};

const defaultCameraConfig: CameraConfig = {
    '1': '/conveyor-video.mp4',
    '2': 'webcam',
    '3': '/conveyor-video.mp4',
    '4': '/conveyor-video.mp4',
};

export function DashboardClient() {
  const searchParams = useSearchParams();
  const selectedBant = searchParams.get('bant') || '1';

  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>(defaultCameraConfig);
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const selectedVideoSource = cameraConfig[selectedBant] || '/conveyor-video.mp4';
  const isWebcam = selectedVideoSource === 'webcam';

  // --- Data Persistence Effects ---
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const savedSettings = localStorage.getItem("conveyorAISettings");
        const savedCameraConfig = localStorage.getItem("conveyorAICameraConfig");
        const savedLogs = localStorage.getItem("conveyorAILogs");

        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        if (savedCameraConfig) {
          setCameraConfig(JSON.parse(savedCameraConfig));
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
        localStorage.setItem("conveyorAISettings", JSON.stringify(newSettings));
    }
  }, [isClient]);

  const saveCameraConfig = useCallback((newConfig: CameraConfig) => {
    setCameraConfig(newConfig);
    if (isClient) {
        localStorage.setItem("conveyorAICameraConfig", JSON.stringify(newConfig));
    }
  }, [isClient]);

  const saveLogs = useCallback((newLogs: AnomalyLog[]) => {
    setLogs(newLogs);
    if (isClient) {
        localStorage.setItem("conveyorAILogs", JSON.stringify(newLogs));
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
    stopCameraStream(); // Stop any previous stream

    const videoElement = videoRef.current;
    if (!videoElement) return;

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
        if (videoRef.current.src !== window.location.origin + selectedVideoSource) {
            videoRef.current.srcObject = null; // Clear srcObject for src to work
            videoRef.current.src = selectedVideoSource;
            videoRef.current.load();
            videoRef.current.play().catch(e => console.error("Video oynatma hatası:", e));
        }
    }
    
    // Cleanup function
    return () => {
      stopCameraStream();
    }

  }, [selectedBant, cameraConfig, isWebcam, toast, selectedVideoSource]);


  useEffect(() => {
    const analyzeFrame = async () => {
      if (isCalibrating || isProcessing || !videoRef.current || !canvasRef.current) return;
  
      setIsProcessing(true);
  
      const video = videoRef.current;
      if (video.paused || video.ended || video.readyState < 3) { 
        setIsProcessing(false);
        return;
      }
      
      // For webcam, permission must be granted
      if (isWebcam && hasCameraPermission === false) { // Explicitly check for false
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
            const newLog: AnomalyLog = { 
                timestamp: new Date().toISOString(), 
                deviation: newDeviation,
                bant: selectedBant
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
  }, [isCalibrating, isProcessing, toast, settings.anomalyThreshold, status, playAlertSound, selectedBant, logs, saveLogs, isWebcam, hasCameraPermission]);

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
  
  const filteredLogs = logs.filter(log => log.bant === selectedBant);
  const isAnomaly = status === "ANOMALİ";

  if (!isClient) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Genel Bakış - Bant {selectedBant}</h1>
        <SettingsDialog 
          settings={settings} 
          onSettingsChange={saveSettings} 
          audioRef={audioRef} 
          isCalibrating={isCalibrating}
          calibrationProgress={calibrationProgress}
          onCalibrate={handleCalibrate}
          cameraConfig={cameraConfig}
          onCameraConfigChange={saveCameraConfig}
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
                  loop={!isWebcam} // Loop only for video files
                  crossOrigin="anonymous"
                  key={selectedVideoSource + selectedBant}
                />
                <canvas ref={canvasRef} className="hidden" />
                
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
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <Loader className="w-4 h-4 animate-spin"/>
                        <span>Yapay Zeka Analiz Ediyor...</span>
                    </div>
                  </div>
                )}
                 <audio ref={audioRef} src="/alert-sound.mp3" preload="auto"></audio>
            </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className={cn(isAnomaly && "bg-destructive text-destructive-foreground")}>
          <CardHeader>
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
          <CardHeader>
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
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(log.timestamp).toLocaleString('tr-TR')}</TableCell>
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
                      Bu bant için henüz anomali kaydedilmedi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Tüm Bantlar İçin 8 Saatlik Eylem Raporu</CardTitle>
            <CardDescription>Son 8 saat içinde tüm bantlarda tespit edilen anomaliler.</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert>
                <Users className="h-4 w-4" />
                <AlertTitle>Gelecek Özellik</AlertTitle>
                <AlertDescription>
                    Bu bölümde, operatör atamaları ve veritabanı entegrasyonu tamamlandığında son 8 saatlik detaylı anomali raporları gösterilecektir.
                </AlertDescription>
            </Alert>
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
  const { toast } = useToast();


  useEffect(() => {
    if (isOpen) {
      setCurrentSettings(settings);
      setCurrentCameraConfig(cameraConfig);
    }
  }, [settings, cameraConfig, isOpen]);

  const handleSave = () => {
    onSettingsChange(currentSettings);
    onCameraConfigChange(currentCameraConfig);
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

  const handleCameraConfigFieldChange = (bant: string, value: string) => {
    setCurrentCameraConfig(prev => ({...prev, [bant]: value}));
  }
  
  const handleScanNetwork = () => {
    toast({
        title: "Özellik Yakında",
        description: "Ağdaki kameraları otomatik bulma özelliği geliştirme aşamasındadır.",
    });
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
            <TabsTrigger value="ai-settings"><BrainCircuit className="mr-2 h-4 w-4"/>Yapay Zeka</TabsTrigger>
            <TabsTrigger value="cameras"><Camera className="mr-2 h-4 w-4"/>Kameralar</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/>Bildirimler</TabsTrigger>
            <TabsTrigger value="operators"><Users className="mr-2 h-4 w-4"/>Operatörler</TabsTrigger>
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
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Label className="text-base">
                            Kamera Yapılandırması
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Her bir konveyör bandı için video kaynağı tanımlayın.
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleScanNetwork}>
                        <Scan className="mr-2 h-4 w-4" />
                        Ağdaki Kameraları Tara
                    </Button>
                </div>
                
                <p className="text-sm text-muted-foreground pt-2">
                    Video dosyası için yolu (örn: `/video.mp4`), cihaz kamerası için `webcam` anahtar kelimesini girin.
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
                                placeholder="örn: /video.mp4 veya webcam"
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
            <div className="flex items-center justify-between rounded-lg border p-4 opacity-50">
              <div className="space-y-0.5">
                <Label htmlFor="sms-alert" className="text-base">
                  SMS & WhatsApp Bildirimi (Yakında)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Acil durumlarda operatörlere anlık bildirim gönder.
                </p>
              </div>
              <Switch
                id="sms-alert"
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
