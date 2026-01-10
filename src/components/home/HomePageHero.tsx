import Icon from '@/components/ui/icon';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
}

interface HomePageHeroProps {
  content: HeroContent;
}

const HomePageHero = ({ content }: HomePageHeroProps) => {
  return (
    <section className="mb-16 text-center">
      <div className="relative w-full mb-8">
        <div className="christmas-lights-garland" style={{ width: '100%', left: '0', right: '0' }}>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
          <div className="garland-light"></div>
        </div>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-full relative z-10">
          <Icon name="Sparkles" size={18} className="text-orange-600" />
          <span className="text-sm font-medium text-orange-800">{content.subtitle}</span>
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
        {content.title}
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        {content.description}
      </p>
    </section>
  );
};

export default HomePageHero;