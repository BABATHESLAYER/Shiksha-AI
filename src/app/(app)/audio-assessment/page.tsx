'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { AudioLines, Sparkles, UploadCloud, Star, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { assessReadingFluency } from '@/ai/flows/assess-reading-fluency';
import { fileToDataUri } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  audioFile: z.instanceof(File).refine((file) => file.size > 0, 'Please upload an audio file.'),
});

type AssessmentResult = {
  fluencyScore: number;
  feedback: string;
};

export default function AudioAssessmentPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audioFile: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('audioFile', file);
      setFileName(file.name);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const dataUri = await fileToDataUri(values.audioFile);
      const assessment = await assessReadingFluency({ audioDataUri: dataUri });
      setResult(assessment);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assess audio. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">Audio Assessment</h1>
        <p className="text-muted-foreground">
          Upload a student's reading audio (.wav or .mp3) to assess their fluency.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="audioFile"
                render={() => (
                  <FormItem>
                    <FormLabel>Student's Audio Recording</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                          <label htmlFor="audio-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                  <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                  {fileName ? (
                                    <p className="font-semibold text-primary">{fileName}</p>
                                  ) : (
                                    <>
                                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload audio</span></p>
                                      <p className="text-xs text-muted-foreground">WAV or MP3 (MAX. 10MB)</p>
                                    </>
                                  )}
                              </div>
                              <Input id="audio-upload" type="file" className="hidden" accept="audio/wav, audio/mpeg" onChange={handleFileChange} ref={fileInputRef}/>
                          </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Assessing...' : <><Sparkles className="mr-2 h-4 w-4" /> Assess Reading</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment in Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold flex items-center gap-2"><Star className="text-primary"/>Fluency Score</h3>
                <span className="font-bold text-lg">{result.fluencyScore} / 10</span>
              </div>
              <Progress value={result.fluencyScore * 10} className="h-3" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><MessageSquare className="text-primary"/>Feedback</h3>
              <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">{result.feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
