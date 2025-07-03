'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateVisualAid } from '@/ai/flows/generate-visual-aid';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  conceptDescription: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
});

export default function VisualAidsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conceptDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setImageUrl(null);
    try {
      const result = await generateVisualAid(values);
      setImageUrl(result.imageUrl);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate visual aid. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">Visual Aids</h1>
        <p className="text-muted-foreground">
          Generate a simple line drawing for any concept.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="conceptDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe Concept</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The water cycle with evaporation, condensation, and precipitation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Drawing</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(isLoading || imageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="text-primary" /> Generated Visual Aid
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full aspect-video rounded-lg" />
            ) : (
              imageUrl && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={imageUrl}
                    alt={form.getValues('conceptDescription')}
                    fill
                    className="object-contain rounded-lg border p-2"
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
