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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      {footer && (
        <CardFooter>
          <CardDescription>{footer}</CardDescription>
        </CardFooter>
      )}
    </Card>
  );
}
