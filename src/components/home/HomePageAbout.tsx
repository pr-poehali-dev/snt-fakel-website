import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AboutContent {
  title: string;
  description: string;
}

interface HomePageAboutProps {
  content: AboutContent;
}

const HomePageAbout = ({ content }: HomePageAboutProps) => {
  return (
    <section className="mb-16">
      <Card className="border-2 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Icon name="TreePine" className="text-white" size={24} />
            </div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-gray-700">
            {content.description}
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default HomePageAbout;