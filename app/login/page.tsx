
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/context';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Loader, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await login(username, password);
      toast({
        title: 'Giriş Başarılı',
        description: 'Kontrol paneline yönlendiriliyorsunuz.',
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Giriş Başarısız',
        description: (error as Error).message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4 magic-card">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                    <Icons.logo className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-2xl">Konveyor AI Paneli</CardTitle>
                <CardDescription>Devam etmek için lütfen giriş yapın.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Kullanıcı Adı</Label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="bg-input/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                             className="bg-input/50"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <LogIn className="mr-2 h-4 w-4" />
                         )}
                        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}
