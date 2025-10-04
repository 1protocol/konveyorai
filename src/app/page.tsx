"use client";
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { Loader }
from 'lucide-react';
import { Icons } from '@/components/icons';

// Asenkron olarak markdown içeriğini getiren fonksiyon
async function getMarkdownContent() {
  const res = await fetch('/PROJE_DOKUMANTASYONU.md');
  if (!res.ok) {
    throw new Error('Doküman yüklenemedi.');
  }
  const markdown = await res.text();
  return marked(markdown);
}

export default function DocumentationPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMarkdownContent()
      .then(html => {
        setHtmlContent(html);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
       <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border">
         <div className="flex items-center gap-3">
          <Icons.logo className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary">
              Konveyor AI: Proje Sunumu
            </h1>
            <p className="text-sm text-muted-foreground">
                Yapay Zeka Destekli Endüstriyel Anomali Tespiti
            </p>
          </div>
         </div>
       </header>

      <main className="container mx-auto px-4 pt-28 pb-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center mt-20">
            <Loader className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Proje dokümanı yükleniyor...</p>
          </div>
        )}
        {error && (
          <div className="text-center mt-20 text-destructive">
            <h2 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && (
          <article
            className="prose prose-invert prose-lg max-w-none 
                       prose-headings:text-primary prose-headings:font-bold prose-headings:border-b prose-headings:border-border/50 prose-headings:pb-2
                       prose-a:text-accent prose-a:transition-colors hover:prose-a:text-accent/80
                       prose-strong:text-foreground
                       prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground
                       prose-code:bg-secondary prose-code:rounded-md prose-code:px-1.5 prose-code:py-1 prose-code:font-mono prose-code:text-sm
                       prose-pre:bg-secondary prose-pre:p-4 prose-pre:rounded-lg
                       prose-img:rounded-lg prose-img:border prose-img:border-border
                       prose-table:border prose-table:border-border/50
                       prose-th:border prose-th:border-border/50 prose-th:p-2
                       prose-td:border prose-td:border-border/50 prose-td:p-2"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </main>
    </div>
  );
}
