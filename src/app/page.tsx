"use client";
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { Loader, UserCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// Asenkron olarak markdown içeriğini getiren fonksiyon
async function getMarkdownContent() {
  const res = await fetch('/README.md');
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
      <main className="container mx-auto px-4 pt-12 pb-12">
        <Card className="mb-12 bg-card/50 border-border/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex-row items-center gap-4">
                <UserCircle className="h-12 w-12 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">HAZIRLAYAN</p>
                    <CardTitle className="text-xl">Adınız Soyadınız</CardTitle>
                </div>
            </CardHeader>
        </Card>

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
                       prose-h1:font-heading prose-h2:font-heading prose-h3:font-heading
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
