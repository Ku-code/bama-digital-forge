import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Rocket, 
  Brain, 
  LineChart, 
  MessageSquare, 
  Lightbulb, 
  Zap, 
  Globe,
  Calendar,
  CircleCheck
} from "@/components/ui/icons";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100');
            entry.target.classList.add('translate-y-0');
          }
        });
      }, 
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, formType: string) => {
    e.preventDefault();
    toast({
      title: "Form Submitted",
      description: `Your ${formType} information has been received. We'll be in touch soon.`,
    });
    e.currentTarget.reset();
  };

  const getLogoPath = () => {
    return language === 'bg' 
      ? '/lovable-uploads/BAMAS_Logo_bg.png'
      : '/lovable-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section id="home" className="relative h-screen flex items-center justify-center text-[#052e40] overflow-hidden">
        <GlobeComponent />
        <div className="relative z-10 text-center max-w-5xl px-4 animate-on-scroll opacity-0 translate-y-4 transition-all duration-1000 ease-out">
          <div className="mb-8 flex justify-center">
            <img 
              src={getLogoPath()} 
              alt="BAMAS Logo" 
              style={{ borderRadius: '1rem' }}
              className="w-64 md:w-72 h-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#052e40]/70">{t("hero.subtitle")}</p>
          <Button className="bg-[#0C9D6A] hover:bg-[#0C9D6A]/90 text-white px-8 py-6 rounded-md text-lg" asChild>
            <a href="#membership">{t("hero.cta")}</a>
          </Button>
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#052e40] animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("about.title")}
          </h2>
          <div className="max-w-3xl mx-auto animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100">
            <p className="text-lg text-[#052e40]/80 leading-relaxed mb-6">
              {t("about.description")}
            </p>
            <p className="text-lg text-[#052e40]/80 leading-relaxed">
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section id="mission" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <h2 className="text-3xl font-bold mb-6 text-[#052e40]">{t("mission.vision.title")}</h2>
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm h-full border-l-4 border-[#0C9D6A]">
                <p className="text-lg text-[#052e40]/80 leading-relaxed">
                  {t("mission.vision.description")}
                </p>
              </div>
            </div>
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100">
              <h2 className="text-3xl font-bold mb-6 text-[#052e40]">{t("mission.mission.title")}</h2>
              <div className="bg-gray-50 p-8 rounded-lg shadow-sm border-l-4 border-[#E62F29]">
                <ul className="text-lg text-[#052e40]/80 space-y-4">
                  <li className="flex items-start">
                    <CircleCheck className="h-6 w-6 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                    <span>{t("mission.mission.item1")}</span>
                  </li>
                  <li className="flex items-start">
                    <CircleCheck className="h-6 w-6 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                    <span>{t("mission.mission.item2")}</span>
                  </li>
                  <li className="flex items-start">
                    <CircleCheck className="h-6 w-6 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                    <span>{t("mission.mission.item3")}</span>
                  </li>
                  <li className="flex items-start">
                    <CircleCheck className="h-6 w-6 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                    <span>{t("mission.mission.item4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="objectives" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#052e40] animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("objectives.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                icon: <MessageSquare className="h-10 w-10" />,
                title: t("objectives.item1.title"),
                description: t("objectives.item1.description")
              },
              {
                icon: <Rocket className="h-10 w-10" />,
                title: t("objectives.item2.title"),
                description: t("objectives.item2.description")
              },
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: t("objectives.item3.title"),
                description: t("objectives.item3.description")
              },
              {
                icon: <LineChart className="h-10 w-10" />,
                title: t("objectives.item4.title"),
                description: t("objectives.item4.description")
              }
            ].map((objective, index) => (
              <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-all animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out" style={{transitionDelay: `${index * 100}ms`}}>
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-[#0C9D6A]/10 mb-4 text-[#0C9D6A]">
                    {objective.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[#052e40]">{objective.title}</h3>
                  <p className="text-[#052e40]/70">{objective.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="membership" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#052e40] animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("membership.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: <Brain className="h-8 w-8" />,
                title: t("membership.benefits.item1.title"),
                description: t("membership.benefits.item1.description")
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: t("membership.benefits.item2.title"),
                description: t("membership.benefits.item2.description")
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: t("membership.benefits.item3.title"),
                description: t("membership.benefits.item3.description")
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: t("membership.benefits.item4.title"),
                description: t("membership.benefits.item4.description")
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: t("membership.benefits.item5.title"),
                description: t("membership.benefits.item5.description")
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: t("membership.benefits.item6.title"),
                description: t("membership.benefits.item6.description")
              }
            ].map((benefit, index) => (
              <Card key={index} className="border border-[#0C9D6A]/20 hover:border-[#0C9D6A]/50 transition-all animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out" style={{transitionDelay: `${index * 100}ms`}}>
                <div className="p-6 flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="text-[#E62F29] mr-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[#052e40]">{benefit.title}</h3>
                  </div>
                  <p className="text-[#052e40]/70">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#052e40] animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("events.title")}
          </h2>
          <div className="bg-gradient-to-br from-[#0C9D6A] to-[#0C9D6A]/80 p-8 rounded-lg shadow-md max-w-4xl mx-auto animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100 text-white">
            <h3 className="text-2xl font-bold mb-4">{t("events.conference.title")}</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-white/20 px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">{t("events.conference.date")}</div>
              <div className="bg-white/20 px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">{t("events.conference.location")}</div>
            </div>
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3">{t("events.conference.topics")}</h4>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="flex items-center">
                  <CircleCheck className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>{t("events.conference.topic1")}</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>{t("events.conference.topic2")}</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>{t("events.conference.topic3")}</span>
                </li>
                <li className="flex items-center">
                  <CircleCheck className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>{t("events.conference.topic4")}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg text-center backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-4">{t("events.conference.register.title")}</h4>
              <p className="mb-6">{t("events.conference.register.description")}</p>
              <Button 
                className="bg-white text-[#0C9D6A] hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                asChild
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdNgeoxrQDH4GxELH_nB5DKBtQZi4flmdtBmop1-znJMPR_Qg/viewform?usp=sharing" target="_blank" rel="noopener noreferrer">
                  {t("events.conference.register.cta")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="partner" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#052e40] animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("partner.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 mt-8">
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <p className="text-lg text-[#052e40]/80 leading-relaxed mb-6">
                {t("partner.description1")}
              </p>
              <p className="text-lg text-[#052e40]/80 leading-relaxed">
                {t("partner.description2")}
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100">
              <h3 className="text-xl font-semibold text-[#052e40] mb-4">{t("partner.interest.title")}</h3>
              <p className="text-lg text-[#052e40]/80 leading-relaxed mb-6">
                {t("partner.interest.description")}
              </p>
              <Button 
                className="bg-[#0C9D6A] hover:bg-[#0C9D6A]/90 text-white w-full"
                asChild
              >
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdRK7kUegigqpdz4Xh-4h3uOer3pEm29T7K2w-6NFWENNfBNA/viewform?usp=dialog" target="_blank" rel="noopener noreferrer">
                  {t("partner.interest.cta")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#052e40] animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("contact.title")}
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100">
              <h3 className="text-xl font-semibold text-[#052e40] mb-4">{t("contact.form.title")}</h3>
              <p className="text-lg text-[#052e40]/80 leading-relaxed mb-6">
                {t("contact.form.description")}
              </p>
              <Button 
                className="bg-[#0C9D6A] hover:bg-[#0C9D6A]/90 text-white w-full"
                asChild
              >
                <a href="https://forms.gle/SaHA8sSpUAWStWKU7" target="_blank" rel="noopener noreferrer">
                  {t("contact.form.cta")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-[#052e40] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-24 h-24 mb-4">
                  <img 
                    src={getLogoPath()} 
                    alt="BAMAS Logo"
                    style={{ borderRadius: '1rem' }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">BAMAS</h3>
                <p className="text-sm text-white/70">{t("hero.subtitle")}</p>
              </div>
            </div>
            
            <div className="md:col-span-1">
            </div>
            
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">{t("footer.resources")}</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-[#0C9D6A] transition-colors">{t("nav.home")}</a></li>
                <li><a href="#about" className="hover:text-[#0C9D6A] transition-colors">{t("nav.about")}</a></li>
                <li><a href="#mission" className="hover:text-[#0C9D6A] transition-colors">{t("nav.mission")}</a></li>
                <li><a href="#membership" className="hover:text-[#0C9D6A] transition-colors">{t("nav.membership")}</a></li>
                <li><a href="#events" className="hover:text-[#0C9D6A] transition-colors">{t("nav.events")}</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">{t("footer.contact")}</h4>
              <ul className="space-y-2">
                <li>
                  <div className="flex space-x-4 mt-4">
                    <a href="#" className="text-white hover:text-[#0C9D6A] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect width="4" height="12" x="2" y="9"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                    </a>
                    <a href="#" className="text-white hover:text-[#0C9D6A] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                      </svg>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p>{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
            <p className="mt-2 text-sm">
              <a href="#" className="hover:text-[#0C9D6A] transition-colors">{t("footer.privacy")}</a> • 
              <a href="#" className="hover:text-[#0C9D6A] transition-colors ml-2">{t("footer.terms")}</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
