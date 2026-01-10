import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface HomePageBenefitsProps {
  benefits: Benefit[];
}

const HomePageBenefits = ({ benefits }: HomePageBenefitsProps) => {
  if (benefits.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="grid md:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <Card key={benefit.id} className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                <Icon name={benefit.icon as any} className="text-white" size={24} />
              </div>
              <CardTitle className="text-xl">{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{benefit.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default HomePageBenefits;
