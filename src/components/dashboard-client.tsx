"use client";

import { useState, useEffect } from "react";
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
import { SlidersHorizontal, AlertTriangle, CheckCircle } from "lucide-react";

type AnomalyLog = {
  timestamp: Date;
  deviation: number;
};

export function DashboardClient() {
  const [deviation, setDeviation] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "ANOMALİ" | "KALİBRE EDİLİYOR">(
    "NORMAL"
  );
  const [logs, setLogs] = useState<AnomalyLog[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isCalibrating) return;

      const isAnomaly = Math.random() > 0.95;
      let newDeviation;
      if (isAnomaly) {
        newDeviation = 2 + Math.random() * 2; // 2mm to 4mm
      } else {
        newDeviation = Math.random() * 1.5; // 0mm to 1.5mm
      }
      setDeviation(newDeviation);

      if (newDeviation >= 2) {
        setStatus("ANOMALİ");
        setLogs((prevLogs) =>
          [
            { timestamp: new Date(), deviation: newDeviation },
            ...prevLogs,
          ].slice(0, 100)
        );
      } else {
        setStatus((prevStatus) =>
          prevStatus === "ANOMALİ" ? "ANOMALİ" : "NORMAL"
        );
        setTimeout(() => {
            if(deviation < 2) setStatus("NORMAL");
        }, 1000)

      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isCalibrating, deviation]);

  useEffect(() => {
    if (calibrationProgress === 100) {
      toast({
        title: "Kalibrasyon Tamamlandı",
        description: "Başlangıç referans verileri ayarlandı.",
      });
    }
  }, [calibrationProgress, toast]);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className={cn(isAnomaly && "bg-accent text-accent-foreground")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
            {status === "NORMAL" && (
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            )}
            {status === "ANOMALİ" && (
              <AlertTriangle className="h-6 w-6 animate-pulse text-accent-foreground" />
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
                isAnomaly ? "text-accent-foreground/80" : "text-muted-foreground"
              )}
            >
              {isAnomaly
                ? "Kayma 2mm eşiğini aşıyor."
                : status === "NORMAL"
                ? "Konveyör bantları parametreler dahilinde çalışıyor."
                : "Referans değerler oluşturuluyor."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mevcut Sapma
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
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                deviation >= 2 && "text-destructive"
              )}
            >
              {deviation.toFixed(2)} mm
            </div>
            <p className="text-xs text-muted-foreground">
              Gerçek zamanlı kayma ölçümü
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">
              Başlangıç Referansı
            </CardTitle>
            <CardDescription className="text-xs">
              {isCalibrating
                ? "Referans oluşturuluyor..."
                : "Yeni referans noktaları ayarlamak için yeniden kalibre edin."}
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
                Kalibrasyonu Başlat
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anomali Kayıtları</CardTitle>
          <CardDescription>
            Kaydedilen anormal kayma örnekleri (sapma &ge; 2mm).
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
