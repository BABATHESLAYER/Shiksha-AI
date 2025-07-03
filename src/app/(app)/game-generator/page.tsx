'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Gamepad2, Sparkles, Check, X } from 'lucide-react';

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
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateGame } from '@/ai/flows/generate-game';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  topic: z.string().min(3, {
    message: 'Topic must be at least 3 characters.',
  }),
});

type McqQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type Quiz = {
  type: 'mcq';
  title: string;
  questions: McqQuestion[];
};

export default function GameGeneratorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [game, setGame] = useState<any | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGame(null);
    setUserAnswers({});
    setSubmitted(false);
    try {
      const result = await generateGame(values);
      const parsedGame = JSON.parse(result.quiz);
      setGame(parsedGame);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate game. The format might be unexpected. Please try a different topic.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({...prev, [questionIndex]: answer}));
  }

  const checkAnswers = () => {
    setSubmitted(true);
  }

  const renderMcq = (quiz: Quiz) => (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>Answer the questions below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {quiz.questions.map((q, index) => (
          <div key={index}>
            <p className="font-semibold mb-4">{index + 1}. {q.question}</p>
            <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)} disabled={submitted}>
              {q.options.map((option, i) => {
                const isCorrect = option === q.answer;
                const isSelected = userAnswers[index] === option;
                
                return (
                  <div key={i} className={cn("flex items-center space-x-2 p-2 rounded-md", submitted && isSelected && !isCorrect && "bg-destructive/20", submitted && isCorrect && "bg-green-500/20")}>
                    <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                    <Label htmlFor={`q${index}-o${i}`} className="flex-1">{option}</Label>
                    {submitted && isSelected && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                    {submitted && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        ))}
        {!submitted && <Button onClick={checkAnswers}>Submit Answers</Button>}
      </CardContent>
    </Card>
  )

  const renderRawJson = (data: any) => (
    <Card>
      <CardHeader>
        <CardTitle>Generated Game</CardTitle>
        <CardDescription>Could not render this game type. Displaying raw data.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">Game Generator</h1>
        <p className="text-muted-foreground">
          Create fun educational games and quizzes on any topic.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Parts of a plant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : <><Sparkles className="mr-2 h-4 w-4" /> Create Game</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      )}

      {game && (
        game.type === 'mcq' && game.questions ? renderMcq(game) : renderRawJson(game)
      )}
    </div>
  );
}
