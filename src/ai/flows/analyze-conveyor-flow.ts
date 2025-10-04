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

Analizine göre sapma miktarını milimetre cinsinden belirle ve 'deviation' alanına yaz.

Gerçek bir sensörün davranışını simüle et. Çoğunlukla 0.1 ile 1.5 arasında normal sapma değerleri üret. Ancak, her 20 çağrıdan birinde, 2.5 ile 4.5 arasında bir anomali (ani yükselme) oluşturarak kritik durumları simüle et. Bu, nadir ama önemli arızaları temsil eder.

Görüntü: {{media url=frameDataUri}}`,
});

const analyzeConveyorBeltFlow = ai.defineFlow(
  {
    name: 'analyzeConveyorBeltFlow',
    inputSchema: AnalyzeConveyorBeltInputSchema,
    outputSchema: AnalyzeConveyorBeltOutputSchema,
  },
  async (input) => {
    // This is a mock implementation to simulate realistic behavior.
    // In a real-world scenario, this would involve a complex computer vision model.

    // Simulate a rare anomaly spike
    const isAnomalySpike = Math.random() < 0.05; // 5% chance of a spike

    let deviation: number;

    if (isAnomalySpike) {
      // Generate a high deviation value for an anomaly
      deviation = 2.5 + Math.random() * 2.0; // Range: 2.5 to 4.5
    } else {
      // Generate a normal, low deviation value
      deviation = 0.1 + Math.random() * 1.4; // Range: 0.1 to 1.5
    }

    return {
      deviation: parseFloat(deviation.toFixed(2)),
    };
  }
);
