import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BotMessageSquare,
  FileText,
  Gamepad2,
  HelpCircle,
  Image as ImageIcon,
  AudioLines,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Ask Shiksha',
    description: 'Generate educational content in any language.',
    icon: BotMessageSquare,
    href: '/ask-shiksha',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    title: 'Worksheet Creator',
    description: 'Create worksheets from textbook images.',
    icon: FileText,
    href: '/worksheet-creator',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Student Questions',
    description: 'Get simple explanations for complex topics.',
    icon: HelpCircle,
    href: '/student-questions',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Visual Aids',
    description: 'Generate simple line drawings for concepts.',
    icon: ImageIcon,
    href: '/visual-aids',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Audio Assessment',
    description: 'Assess student reading fluency from audio.',
    icon: AudioLines,
    href: '/audio-assessment',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    title: 'Game Generator',
    description: 'Create fun quizzes and games for any topic.',
    icon: Gamepad2,
    href: '/game-generator',
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Welcome back, Teacher!
        </h1>
        <p className="text-muted-foreground">
          Here are your AI-powered tools to help you in the classroom.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href}>
            <Card className="h-full transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
