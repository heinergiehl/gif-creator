import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
interface CustomCardProps {
  title: string;
  description: string;
  footer?: string;
}
export default function CustomCard({ title, description, footer }: CustomCardProps) {
  return (
    <div className="group relative rounded-lg">
      <div
        className="
      absolute -inset-1.5 rounded-md bg-pink-600
      bg-gradient-to-r from-pink-500 to-purple-600 opacity-70 blur
      transition duration-1000 group-hover:opacity-100 group-hover:duration-500
      "
      >
        {' '}
      </div>
      <Card className="relative h-full rounded-xl">
        <CardHeader>
          <CardTitle
            className={`
          text-2xl font-bold text-gray-800 transition duration-200 group-hover:text-gray-700 dark:text-gray-200
          dark:group-hover:text-white
          `}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription
            className={`
              text-inherit transition duration-200
                group-hover:text-gray-600 dark:text-gray-200
                dark:group-hover:text-white
              `}
          >
            {description}
          </CardDescription>
        </CardContent>
        {footer && <CardFooter> {footer}</CardFooter>}
      </Card>
    </div>
  );
}
