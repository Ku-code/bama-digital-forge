import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
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
import { FooterSection } from "@/components/ui/footer-section";
import { useLanguage } from "@/contexts/LanguageContext";
import PartnerLogosCarousel from "@/components/PartnerLogosCarousel";
import BoardMembersCarousel from "@/components/BoardMembersCarousel";
import NewsBanner from "@/components/NewsBanner";
import AdditiveDaysBanner from "@/components/AdditiveDaysBanner";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Zap as ZapIcon, Target, Rocket as RocketIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MembershipForm, { ApplicationType } from "@/components/MembershipForm";
import { GradientShaderHero } from "@/components/ui/gradient-shader-hero";

const Index = () => {
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<'vision' | 'mission' | null>(null);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [membershipType, setMembershipType] = useState<ApplicationType | undefined>(undefined);

  const openMembership = (type?: ApplicationType) => {
    setMembershipType(type);
    setIsMembershipOpen(true);
  };

  const handleMembershipSuccess = (data: { email: string; name: string }) => {
    setIsMembershipOpen(false);
    navigate('/membership-success', { state: data });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100');
            entry.target.classList.add('translate-y-0');
            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>, formType: string) => {
    e.preventDefault();
    toast({
      title: "Form Submitted",
      description: `Your ${formType} information has been received. We'll be in touch soon.`,
    });
    e.currentTarget.reset();
  }, [toast]);

  const logoPath = useMemo(() => {
    return language === 'bg'
      ? '/bamas-uploads/BAMAS_Logo_bg.png'
      : '/bamas-uploads/6e77d85a-74ad-47e5-b141-a339ec981d57.png';
  }, [language]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <section id="home" className="relative pt-20 md:pt-24 scroll-mt-20 md:scroll-mt-24 overflow-hidden">
        <AdditiveDaysBanner />
        <NewsBanner />
        <GradientShaderHero
          speed={0.85}
          amplitude={0.22}
          eyebrow={
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm md:text-base font-semibold leading-snug text-white/85">
                {t("hero.badge")}
              </span>
            </motion.div>
          }
          action={
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('membership')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 px-5 md:px-7 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white transition-colors duration-300"
            >
              {t("hero.cta")}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          }
          headline={
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
            >
              <h1
                className={`font-extrabold text-white tracking-tight leading-[1.05] ${language === 'bg'
                  ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
                  : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl'
                  }`}
              >
                {t("hero.title")}
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "6rem" }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-5 h-1 rounded-full bg-primary"
              />
              <p className="mt-5 max-w-xl text-sm sm:text-base md:text-lg text-white/70 leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </motion.div>
          }
          links={
            <>
              {[
                { label: t("nav.about"), id: 'about' },
                { label: t("nav.membership"), id: 'membership' },
                { label: t("nav.contact"), id: 'contact' },
              ].map((l, i) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center gap-1.5 text-sm md:text-base text-foreground/55 hover:text-primary transition-colors duration-300"
                >
                  {l.label}
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
              ))}
            </>
          }
        />
      </section>

      <section id="about" className="py-12 md:py-20 bg-muted/30 relative overflow-hidden scroll-mt-20 md:scroll-mt-24">
        {/* Background image with reduced opacity - centered behind text */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'url(/bamas-map-logo.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 10%',
            backgroundSize: isMobile ? 'auto 70%' : 'auto 120%',
            opacity: 0.25
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 md:mb-12 text-center text-foreground animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out px-4">
            {t("about.title")}
          </h2>
          <div className="max-w-3xl mx-auto animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100">
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-4 md:mb-6 px-4 font-normal">
              {t("about.description")}
            </p>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed px-4 font-normal">
              {t("about.subtitle")}
            </p>
          </div>

          {/* Board Members Section */}
          <div className="mt-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-200">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-8 text-center text-foreground px-4">
              {language === "bg" ? "Управителен съвет и Представителство" : "Board of Directors"}
            </h3>
            <BoardMembersCarousel />
          </div>
        </div>
      </section>

      <section id="mission" className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden scroll-mt-20 md:scroll-mt-24">
        {/* Background decorative elements - Green bloom effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              {t("mission.section.title")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto shadow-lg shadow-primary/50"></div>
          </div>

          {/* Vision and Mission Side by Side */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100"
              >
                <Card
                  className="h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                  onClick={() => setExpandedCard(expandedCard === 'vision' ? null : 'vision')}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                          {t("mission.vision.title")}
                        </h3>
                      </div>
                      {expandedCard === 'vision' ? (
                        <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-primary/60 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-base md:text-lg text-foreground/80 leading-relaxed px-4 font-normal">
                        {t("mission.vision.short")}
                      </p>
                      {expandedCard === 'vision' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-base md:text-lg text-foreground/80 leading-relaxed px-4 pt-2 border-t border-primary/20">
                            {t("mission.vision.description")}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-200"
              >
                <Card
                  className="h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                  onClick={() => setExpandedCard(expandedCard === 'mission' ? null : 'mission')}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <RocketIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
                          {t("mission.mission.title")}
                        </h3>
                      </div>
                      {expandedCard === 'mission' ? (
                        <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-primary/60 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-base md:text-lg text-foreground/80 leading-relaxed px-4 font-normal">
                        {t("mission.mission.short")}
                      </p>
                      {expandedCard === 'mission' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-base md:text-lg text-foreground/80 leading-relaxed px-4 pt-2 border-t border-primary/20">
                            {t("mission.mission.description")}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Mission Pillars Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-300">
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                  {t("mission.mission.subtitle")}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Users className="h-7 w-7" />,
                    text: t("mission.mission.item1"),
                    color: "from-primary/20 to-primary/10",
                    borderColor: "border-primary/30",
                    iconBg: "bg-primary/20",
                    iconColor: "text-primary"
                  },
                  {
                    icon: <Rocket className="h-7 w-7" />,
                    text: t("mission.mission.item2"),
                    color: "from-primary/25 to-primary/15",
                    borderColor: "border-primary/30",
                    iconBg: "bg-primary/20",
                    iconColor: "text-primary"
                  },
                  {
                    icon: <Lightbulb className="h-7 w-7" />,
                    text: t("mission.mission.item3"),
                    color: "from-primary/20 to-primary/10",
                    borderColor: "border-primary/30",
                    iconBg: "bg-primary/20",
                    iconColor: "text-primary"
                  },
                  {
                    icon: <Globe className="h-7 w-7" />,
                    text: t("mission.mission.item4"),
                    color: "from-primary/25 via-primary/20 to-primary/15",
                    borderColor: "border-primary/30",
                    iconBg: "bg-primary/20",
                    iconColor: "text-primary"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out"
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <Card className={`h-full bg-card border-2 ${item.borderColor} hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br ${item.color}`}>
                      <div className="p-6">
                        <div className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-4 ${item.iconColor}`}>
                          {item.icon}
                        </div>
                        <p className="text-base text-foreground leading-relaxed font-medium">
                          {item.text}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="objectives" className="py-12 md:py-20 bg-muted/30 scroll-mt-20 md:scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 md:mb-12 text-center text-foreground animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out px-4">
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
              <Card key={index} className="bg-card shadow-md hover:shadow-lg transition-all animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4 text-primary">
                    {objective.icon}
                  </div>
                  <h3 className="text-xl font-extrabold mb-3 text-foreground">{objective.title}</h3>
                  <p className="text-foreground/70 font-body-light">{objective.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="membership-pricing" className="py-12 md:py-20 bg-muted/30 scroll-mt-20 md:scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center text-foreground animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            {t("membership.pricing.title")}
          </h2>
          <p className="text-lg text-center text-foreground/70 mb-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100 font-normal">
            {t("membership.pricing.subtitle")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                title: t("membership.pricing.individual.title"),
                description: t("membership.pricing.individual.description"),
                priceBGN: 250,
                priceEUR: 128,
                isFree: false,
                isHighlighted: false
              },
              {
                title: t("membership.pricing.company.title"),
                description: t("membership.pricing.company.description"),
                priceBGN: 500,
                priceEUR: 255,
                isFree: false,
                isHighlighted: true
              },
              {
                title: t("membership.pricing.organization.title"),
                description: t("membership.pricing.organization.description"),
                priceBGN: 0,
                priceEUR: 0,
                isFree: true,
                isHighlighted: false
              },
              {
                title: t("membership.pricing.foreign.title"),
                description: t("membership.pricing.foreign.description"),
                priceBGN: 1000,
                priceEUR: 510,
                isFree: false,
                isHighlighted: false
              }
            ].map((tier, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl animate-on-scroll opacity-0 translate-y-4 bg-card ${tier.isHighlighted
                  ? "border-2 border-primary shadow-lg scale-105"
                  : "border border-border/40 hover:border-primary/50"
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {tier.isHighlighted && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-foreground mb-2">{tier.title}</h3>
                  <p className="text-sm text-foreground/70 mb-6 flex-grow">{tier.description}</p>

                  <div className="mb-6">
                    {tier.isFree ? (
                      <div className="text-center">
                        <div className="text-5xl font-black text-primary mb-2">
                          {t("membership.pricing.free")}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                          <span className="text-4xl md:text-5xl font-black text-foreground">
                            €{tier.priceEUR}
                          </span>
                          <span className="text-lg text-foreground/60 font-medium">
                            EUR
                          </span>
                        </div>
                        <div className="text-sm text-foreground/50">
                          {tier.priceBGN} BGN
                        </div>
                        <div className="text-xs text-foreground/40 mt-1">
                          {t("membership.pricing.perYear")}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className={`w-full ${tier.isHighlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : tier.isFree
                        ? "bg-muted hover:bg-muted/80 text-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      }`}
                    onClick={() => {
                      const types: ApplicationType[] = ['individual', 'company', 'academic', 'foreign'];
                      openMembership(types[index]);
                    }}
                  >
                    {t("membership.pricing.cta")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="membership" className="py-12 md:py-20 bg-background scroll-mt-20 md:scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 md:mb-12 text-center text-foreground animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out px-4">
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
              <Card key={index} className="border border-primary/20 hover:border-primary/50 transition-all animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out bg-card" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="p-6 flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="text-destructive mr-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-extrabold text-foreground">{benefit.title}</h3>
                  </div>
                  <p className="text-foreground/70 font-body-light">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Apply for Membership CTA */}
          <div className="mt-12 text-center animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-500">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group"
                onClick={() => openMembership()}
              >
                <span>{language === 'bg' ? 'Кандидатствайте за членство' : 'Apply for Membership'}</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="mt-4 text-sm text-foreground/60">
                {language === 'bg'
                  ? 'Попълнете формуляра за кандидатстване и станете част от БАЗАП'
                  : 'Fill out the application form and become a BAMAS member'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="events" className="py-16 md:py-24 bg-muted/30 scroll-mt-20 md:scroll-mt-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
              {t("events.title")}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto relative px-4">
            {/* Minimalist Vertical Line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-2 bottom-0 w-px bg-border sm:block"></div>

            <div className="space-y-8 md:space-y-12">
              {/* Event 1: July 2025 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-start md:items-center md:justify-end md:pr-10"
              >
                <div className="absolute left-[7px] md:left-1/2 md:-translate-x-1/2 w-2.5 h-2.5 rounded-full bg-muted-foreground/30 z-10"></div>
                <div className="ml-10 md:ml-0 md:w-[45%]">
                  <div className="bg-background/50 border border-border/50 p-4 rounded-lg hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{t("events.july2025.date")}</span>
                    <h4 className="text-sm font-extrabold text-foreground/80">{t("events.july2025.title")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("events.july2025.location")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Event 2: Nov 2025 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-start md:items-center md:justify-start md:pl-10"
              >
                <div className="absolute left-[7px] md:left-1/2 md:-translate-x-1/2 w-2.5 h-2.5 rounded-full bg-muted-foreground/30 z-10"></div>
                <div className="ml-10 md:ml-0 md:w-[45%]">
                  <div className="bg-background/50 border border-border/50 p-4 rounded-lg hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{t("events.nov2025.date")}</span>
                    <h4 className="text-sm font-extrabold text-foreground/80">{t("events.nov2025.title")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("events.nov2025.location")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Event 3: Jan 2026 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-start md:items-center md:justify-end md:pr-10"
              >
                <div className="absolute left-[7px] md:left-1/2 md:-translate-x-1/2 w-2.5 h-2.5 rounded-full bg-muted-foreground/30 z-10"></div>
                <div className="ml-10 md:ml-0 md:w-[45%]">
                  <div className="bg-background/50 border border-border/50 p-4 rounded-lg hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{t("events.jan2026.date")}</span>
                    <h4 className="text-sm font-extrabold text-foreground/80">{t("events.jan2026.title")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("events.jan2026.location")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Status Separator */}
              <div className="relative flex justify-center py-2">
                <div className="bg-primary/5 text-primary px-3 py-0.5 rounded-full text-[10px] font-bold border border-primary/10 relative z-20 backdrop-blur-sm">
                  {language === 'bg' ? 'ПРЕДСТОЯЩИ' : 'UPCOMING'}
                </div>
              </div>

              {/* Event 4: Online Discussion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-start md:items-center md:justify-start md:pl-10"
              >
                <div className="absolute left-[5px] md:left-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full bg-primary border-4 border-background z-10"></div>
                <div className="ml-10 md:ml-0 md:w-[45%]">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg shadow-sm">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">{t("events.online_discussion.date")}</span>
                    <h4 className="text-sm font-extrabold text-foreground">{t("events.online_discussion.title")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("events.online_discussion.description")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Event 5: June 2026 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-start md:items-center md:justify-end md:pr-10"
              >
                <div className="absolute left-[5px] md:left-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full bg-primary border-4 border-background z-10"></div>
                <div className="ml-10 md:ml-0 md:w-[45%]">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg shadow-sm">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">{t("events.board_meeting_june.date")}</span>
                    <h4 className="text-sm font-extrabold text-foreground">{t("events.board_meeting_june.title")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t("events.board_meeting_june.description")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Event 6: Nov 2026 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row items-start md:items-center md:justify-start md:pl-10 pb-4"
              >
                <div className="absolute left-[5px] md:left-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full bg-primary border-4 border-background z-10"></div>
                <div className="ml-10 md:ml-0 md:w-[60%]">
                  <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-5 rounded-xl border-none shadow-lg text-primary-foreground relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block mb-1">{t("events.conference_nov.date")}</span>
                      <h4 className="text-lg font-black leading-tight mb-2">{t("events.conference_nov.title")}</h4>
                      <p className="text-xs opacity-90 mb-4">{t("events.conference_nov.description")}</p>
                      <Button size="sm" className="bg-background text-primary hover:bg-background/90 h-8 text-[10px] font-bold px-4" asChild>
                        <a href="#contact">{language === 'bg' ? 'Заявка за интерес' : 'Register Interest'}</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="partner" className="py-12 md:py-20 bg-background scroll-mt-20 md:scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 md:mb-12 text-center text-foreground animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out px-4">
            {t("partner.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 mt-8">
            <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-4 md:mb-6 px-4 font-body-light">
                {t("partner.description1")}
              </p>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed px-4 font-body-light">
                {t("partner.description2")}
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-sm animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100">
              <h3 className="text-xl font-semibold text-foreground mb-4">{t("partner.interest.title")}</h3>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-4 md:mb-6 px-4">
                {t("partner.interest.description")}
              </p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                onClick={() => openMembership('foreign')}
              >
                {t("partner.interest.cta")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="py-12 md:py-20 bg-muted/30 scroll-mt-20 md:scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 md:mb-6 text-center text-primary animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out px-4">
            {language === "bg" ? "Компаниите, които формират индустрията за адитивно производство в България" : "The Companies Shaping Bulgaria's Additive Manufacturing Industry"}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center mb-8 md:mb-12 px-4 max-w-3xl mx-auto animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100 font-light">
            {language === "bg" ? "Заедно изграждаме бъдещето на 3D технологиите и иновациите" : "Building the future of 3D technologies and innovation, together"}
          </p>
          <div className="animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out">
            <PartnerLogosCarousel />
          </div>
        </div>
      </section>

      <section id="contact" className="py-12 md:py-20 bg-muted/30 scroll-mt-20 md:scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-8 md:mb-12 text-center text-foreground animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out px-4">
            {t("contact.title")}
          </h2>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
              <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-100 flex flex-col h-full">
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-3 sm:mb-4">{t("contact.form.title")}</h3>
                <p className="text-sm sm:text-base md:text-lg text-foreground/80 leading-relaxed mb-4 sm:mb-6 flex-grow font-body-light">
                  {t("contact.form.description")}
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full text-sm sm:text-base mt-auto"
                  asChild
                >
                  <a href="mailto:info@bamas.xyz?subject=Contact%20from%20BAMAS%20Website">
                    {t("contact.form.cta")}
                  </a>
                </Button>
              </div>

              <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-200 flex flex-col h-full">
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-3 sm:mb-4">{t("contact.discord.title")}</h3>
                <p className="text-sm sm:text-base md:text-lg text-foreground/80 leading-relaxed mb-4 sm:mb-6 flex-grow font-body-light">
                  {t("contact.discord.description")}
                </p>
                <Button
                  className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white w-full text-sm sm:text-base mt-auto"
                  asChild
                >
                  <a href="https://discord.gg/hM6Snchf9N" target="_blank" rel="noopener noreferrer">
                    {t("contact.discord.cta")}
                  </a>
                </Button>
              </div>

              <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-300 sm:col-span-2 lg:col-span-1 flex flex-col h-full">
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-3 sm:mb-4">{t("contact.viber.title")}</h3>
                <p className="text-sm sm:text-base md:text-lg text-foreground/80 leading-relaxed mb-4 sm:mb-6 flex-grow font-body-light">
                  {t("contact.viber.description")}
                </p>
                <Button
                  className="bg-[#665CAC] hover:bg-[#665CAC]/90 text-white w-full text-sm sm:text-base mt-auto"
                  asChild
                >
                  <a href="https://invite.viber.com/?g2=AQA7VGQ9uWfQ3FWlDylP2%2BUG%2FEvuxPVitIKgm0VBBfQ6locvqZmob4hpS4rjkhXO" target="_blank" rel="noopener noreferrer">
                    {t("contact.viber.cta")}
                  </a>
                </Button>
              </div>
            </div>

            {/* Google Maps Section */}
            <div className="bg-card p-8 rounded-lg shadow-md animate-on-scroll opacity-0 translate-y-4 transition-all duration-700 ease-out delay-400">
              <h3 className="text-xl font-extrabold text-foreground mb-4 text-center">
                {t("contact.location.title")}
              </h3>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-6 text-center px-4 font-body-light">
                {t("contact.location.description")}
              </p>
              <div className="w-full rounded-lg overflow-hidden border border-border/50 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6019356.767090495!2d14.43004323370686!3d42.5523403136874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6dbf683d01fab4c3%3A0x74dbbf4def49e93a!2sBulgarian%20Additive%20Manufacturing%20Association%20(BAMAS)!5e0!3m2!1sen!2sbg!4v1767378707394!5m2!1sen!2sbg"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                  title="BAMAS Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection
        translations={{
          newsletter: {
            title: t("footer.newsletter.title"),
            description: t("footer.newsletter.description"),
            placeholder: t("footer.newsletter.placeholder"),
            subscribe: t("footer.newsletter.subscribe")
          },
          quickLinks: {
            title: t("footer.resources"),
            home: t("nav.home"),
            about: t("nav.about"),
            mission: t("nav.mission"),
            membership: t("nav.membership"),
            events: t("nav.events"),
            contact: t("nav.contact")
          },
          contact: {
            title: t("footer.contact"),
            address: "Sofia, Bulgaria",
            email: "info@bamas.xyz"
          },
          followUs: {
            title: "Follow Us",
            linkedin: "Connect with us on LinkedIn"
          },
          copyright: t("footer.copyright").replace("{year}", new Date().getFullYear().toString()),
          privacy: t("footer.privacy"),
          terms: t("footer.terms"),
          cookieSettings: "Cookie Settings",
          addliance: t("footer.addliance.text")
        }}
        socialLinks={{
          linkedin: "https://www.linkedin.com/company/bulgarian-additive-manufacturing-association/"
        }}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        onNewsletterSubmit={(email) => {
          toast({
            title: "Newsletter Subscription",
            description: `Thank you for subscribing with ${email}! We'll keep you updated.`,
          });
        }}
      />

      <Dialog open={isMembershipOpen} onOpenChange={setIsMembershipOpen}>
        <DialogContent className="max-w-5xl max-h-[98vh] sm:max-h-[90vh] bg-slate-950 border-white/10 p-0 sm:rounded-3xl overflow-hidden glassmorphism shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Membership Application</DialogTitle>
          </DialogHeader>
          <div className="h-[98vh] sm:h-[90vh]">
            <MembershipForm
              initialType={membershipType}
              onSuccess={handleMembershipSuccess}
              onClose={() => setIsMembershipOpen(false)}
              isModal={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
