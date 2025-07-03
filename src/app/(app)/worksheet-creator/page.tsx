'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { FileText, Sparkles, UploadCloud } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { generateWorksheets } from '@/ai/flows/generate-worksheets';
import { fileToDataUri } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const grades = [
  { id: '1', label: 'Grade 1' },
  { id: '2', label: 'Grade 2' },
  { id: '3', label: 'Grade 3' },
  { id: '4', label: 'Grade 4' },
  { id: '5', label: 'Grade 5' },
] as const;

const formSchema = z.object({
  textbookImage: z.instanceof(File).refine((file) => file.size > 0, 'Please upload an image.'),
  targetGrades: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one grade.',
  }),
});

export default function WorksheetCreatorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorksheets, setGeneratedWorksheets] = useState<string[] | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textbookImage: undefined,
      targetGrades: [],
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('textbookImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedWorksheets(null);
    try {
      const dataUri = await fileToDataUri(values.textbookImage);
      const result = await generateWorksheets({
        textbookImage: dataUri,
        targetGrades: values.targetGrades.map(Number),
      });
      setGeneratedWorksheets(result.worksheets);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate worksheets. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">Worksheet Creator</h1>
        <p className="text-muted-foreground">
          Upload a textbook page and select grades to generate custom worksheets.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="textbookImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Textbook Page Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {previewImage ? (
                                    <Image src={previewImage} alt="Preview" width={150} height={150} className="object-contain h-48"/>
                                  ) : (
                                    <>
                                      <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                                    </>
                                  )}
                              </div>
                              <Input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                          </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetGrades"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Target Grades</FormLabel>
                      <FormDescription>
                        Select the grade levels for which you want to generate worksheets.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {grades.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="targetGrades"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Worksheets</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )}

      {generatedWorksheets && (
        <div className="space-y-6">
          {generatedWorksheets.map((worksheet, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="text-primary" /> Worksheet {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: worksheet.replace(/\n/g, '<br />') }} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
