import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  CircleCheck,
  Mail,
  MapPin
} from "@/components/ui/icons";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [votedDate, setVotedDate] = useState("");
  const [votes, setVotes] = useState({
    "May 20, 2025": 12,
    "June 2, 2025": 8,
    "June 9, 2025": 15
  });

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

  const handleVote = (date: string) => {
    setVotedDate(date);
    setVotes(prev => ({
      ...prev,
      [date]: prev[date] + 1
    }));
    toast({
      title: "Vote Submitted",
      description: `Thank you for voting for ${date}. Your preference has been recorded.`,
    });
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const getPercentage = (voteCount: number) => Math.round((voteCount / totalVotes) * 100);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section id="home" className="relative h-screen flex items-center justify-center text-[#052e40] overflow-hidden">
        <GlobeComponent />
        <div className="relative z-10 text-center max-w-5xl px-4 animate-on-scroll opacity-0 translate-y-4 transition-all duration-1000 ease-out">
          <div className="mb-8 flex justify-center">
            <img 
              src="/lovable-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png" 
              alt="BAMAS Logo" 
              style={{ borderRadius: '50%' }}
              className="w-64 md:w-72 h-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#052e40]/70">Uniting Innovation. Empowering Industry. Shaping the Future.</p>
          <Button className="bg-[#0C9D6A] hover:bg-[#0C9D6A]/90 text-white px-8 py-6 rounded-md text-lg shadow-[0_0_15px_rgba(12,157,106,0.5)] hover:shadow-[0_0_20px_rgba(12,157,106,0.7)]" asChild>
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
          
          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
            <Card className="border border-[#0C9D6A]/20 hover:border-[#0C9D6A]/50 transition-all animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out overflow-hidden">
              <div className="bg-gradient-to-r from-[#0C9D6A]/10 to-[#0C9D6A]/5 p-6">
                <h3 className="text-2xl font-bold text-[#052e40] mb-2">Individual Membership</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-[#E62F29]">50 BGN</span>
                  <span className="text-lg line-through ml-2 text-gray-500">100 BGN</span>
                  <span className="ml-2 bg-[#E62F29] text-white text-sm px-2 py-1 rounded-full">50% OFF</span>
                </div>
                <p className="text-[#052e40]/70 mb-4">First year promotional price</p>
                <p className="text-[#052e40]/70 mb-4 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                  <strong>Exclusive Offer:</strong> This 50% discount is an initial entry promotion available for a limited time only. Join today to secure this special rate!
                </p>
                
                <Button className="w-full bg-[#0C9D6A] hover:bg-[#0C9D6A]/90 text-white shadow-[0_0_15px_rgba(12,157,106,0.5)] hover:shadow-[0_0_20px_rgba(12,157,106,0.7)]">
                  Subscribe Now
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="benefits">
                  <AccordionTrigger className="px-6">Membership Benefits</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Access to all BAMAS networking events</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Professional development opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Discounted conference tickets</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Industry insights and reports</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Voting rights in BAMAS initiatives</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>European Additive Manufacturing Industry representation</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Access to new market opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Business connections with European companies</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
            
            <Card className="border border-[#0C9D6A]/20 hover:border-[#0C9D6A]/50 transition-all animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out overflow-hidden">
              <div className="bg-gradient-to-r from-[#0C9D6A]/20 to-[#0C9D6A]/10 p-6">
                <h3 className="text-2xl font-bold text-[#052e40] mb-2">Corporate Membership</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-[#E62F29]">100 BGN</span>
                  <span className="text-lg line-through ml-2 text-gray-500">200 BGN</span>
                  <span className="ml-2 bg-[#E62F29] text-white text-sm px-2 py-1 rounded-full">50% OFF</span>
                </div>
                <p className="text-[#052e40]/70 mb-4">First year promotional price</p>
                <p className="text-[#052e40]/70 mb-4 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                  <strong>Exclusive Offer:</strong> This 50% discount is an initial entry promotion available for a limited time only. Join today to secure this special rate!
                </p>
                
                <Button className="w-full bg-[#0C9D6A] hover:bg-[#0C9D6A]/90 text-white shadow-[0_0_15px_rgba(12,157,106,0.5)] hover:shadow-[0_0_20px_rgba(12,157,106,0.7)]">
                  Subscribe Now
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="benefits">
                  <AccordionTrigger className="px-6">Membership Benefits</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>All individual benefits for up to 5 employees</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Company logo on BAMAS website</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Priority speaking opportunities at events</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Opportunity to host industry workshops</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Direct access to talent network</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Exclusive industry partnership opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Enhanced representation in European forums</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Opening to new European market opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Enhanced networking with international partners</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Priority access to European AM industry conferences</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Dedicated support for EU funding applications</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Quarterly business matching with European partners</span>
                      </li>
                      <li className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                        <span>Featured profile in European AM industry directory</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
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
              <div className="bg-white/20 px-3 py-1 rounded text-sm font-medium backdrop-blur-sm flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <a href="https://maps.app.goo.gl/itFtMp9FbZipFMB56" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Capital Fort Building<br />
                  <span className="text-xs">7-Mi Kilometar Mladost, Boulevard "Tsarigradsko shose", 1784 Sofia</span>
                </a>
              </div>
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
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm mb-8">
              <h4 className="text-xl font-semibold mb-4">Help Us Choose the Conference Date</h4>
              <p className="mb-6">Please vote for your preferred conference date. <span className="font-medium bg-white/20 px-2 py-1 rounded">Important: When registering via the Google Form below, please include your preferred date in the notes section!</span></p>
              
              <RadioGroup value={votedDate} className="space-y-3 mb-6">
                {Object.entries(votes).map(([date, voteCount]) => {
                  const percentage = getPercentage(voteCount);
                  return (
                    <div key={date} className="relative">
                      <div className="flex items-center space-x-2 mb-1">
                        <RadioGroupItem value={date} id={`date-${date}`} onClick={() => handleVote(date)} />
                        <Label htmlFor={`date-${date}`} className="cursor-pointer">{date}</Label>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/60 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm mt-1 flex justify-between">
                        <span>{voteCount} votes</span>
                        <span>{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
              
              {votedDate && (
                <div className="bg-white/20 p-3 rounded text-center">
                  Thank you for voting for: <strong>{votedDate}</strong>. 
                  Please remember to include this date preference when registering below!
                </div>
              )}
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg text-center backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-4">{t("events.conference.register.title")}</h4>
              <p className="mb-6">{t("events.conference.register.description")}</p>
              <p className="mb-6 bg-white/20 p-3 rounded-md text-sm">
                <strong>Note:</strong> When registering, please include your preferred conference date in the notes section of the form. This will help us finalize the date that works best for most attendees.
              </p>
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
                <div className="w-24 h-24 mb-4 overflow-hidden rounded-full bg-white p-2">
                  <img 
                    src="/lovable-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png" 
                    alt="BAMAS Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">BAMAS</h3>
                <p className="text-sm text-white/70">Uniting Innovation. Empowering Industry. Shaping the Future.</p>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-[#0C9D6A] mr-2 flex-shrink-0 mt-1" />
                  <a href="mailto:info@bamas.xyz" className="hover:text-[#0C9D6A] transition-colors">info@bamas.xyz</a>
                </li>
              </ul>
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
