'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateEducationalContent } from '@/ai/flows/generate-educational-content';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, {
      message: 'Prompt must be at least 10 characters.',
    })
    .max(200, {
      message: 'Prompt must not be longer than 200 characters.',
    }),
});

export default function AskShikshaPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateEducationalContent(values);
      setGeneratedContent(result.generatedContent);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">Ask Shiksha</h1>
        <p className="text-muted-foreground">
          Generate educational content in a local language. For example, "Explain solar system in Marathi".
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Explain the water cycle in Hindi for Grade 3"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  'Generating...'
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Content
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> Shiksha is thinking...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            {generatedContent.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
