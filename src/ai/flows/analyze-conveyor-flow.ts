'use server';
/**
 * @fileOverview Konveyör bandı görüntüsünü analiz eden bir yapay zeka akışı.
 *
 * - analyzeConveyorBelt - Konveyör bandı analiz sürecini yöneten fonksiyon.
 * - AnalyzeConveyorBeltInput - analyzeConveyorBelt fonksiyonunun giriş tipi.
 * - AnalyzeConveyorBeltOutput - analyzeConveyorBelt fonksiyonunun dönüş tipi.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeConveyorBeltInputSchema = z.object({
  frameDataUri: z
    .string()
    .describe(
      "Konveyör bandının bir fotoğrafı, bir veri URI'si olarak. Bir MIME türü içermeli ve Base64 kodlaması kullanmalıdır. Beklenen format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeConveyorBeltInput = z.infer<
  typeof AnalyzeConveyorBeltInputSchema
>;

const AnalyzeConveyorBeltOutputSchema = z.object({
  deviation: z
    .number()
    .describe(
      'Konveyör bandının kenarındaki sapma miktarı (milimetre cinsinden).'
    ),
});
export type AnalyzeConveyorBeltOutput = z.infer<
  typeof AnalyzeConveyorBeltOutputSchema
>;

export async function analyzeConveyorBelt(
  input: AnalyzeConveyorBeltInput
): Promise<AnalyzeConveyorBeltOutput> {
  return analyzeConveyorBeltFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeConveyorBeltPrompt',
  input: { schema: AnalyzeConveyorBeltInputSchema },
  output: { schema: AnalyzeConveyorBeltOutputSchema },
  prompt: `Sen, endüstriyel üretim hatlarındaki konveyör bantlarının güvenliğini denetleyen bir yapay zeka asistanısın. Görevin, sağlanan görüntüdeki konveyör bandının kenarında herhangi bir hizalama bozukluğu veya sapma olup olmadığını analiz etmektir.

Normal çalışma koşullarında sapma 2 mm'den az olmalıdır. Analizine göre sapma miktarını milimetre cinsinden belirle ve 'deviation' alanına yaz.

Eğer bir anomali (sapma >= 2mm) tespit edersen, sapma değerini 2.0 ile 4.0 arasında rastgele bir sayı olarak ayarla. Eğer her şey normal görünüyorsa, sapma değerini 0.0 ile 1.5 arasında rastgele bir sayı olarak ayarla. Bu, gerçek bir sensörün davranışını simüle etmek içindir.

Görüntü: {{media url=frameDataUri}}`,
});

const analyzeConveyorBeltFlow = ai.defineFlow(
  {
    name: 'analyzeConveyorBeltFlow',
    inputSchema: AnalyzeConveyorBeltInputSchema,
    outputSchema: AnalyzeConveyorBeltOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
