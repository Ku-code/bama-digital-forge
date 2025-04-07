
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
  Mail, 
  Calendar,
  ArrowDown
} from "lucide-react";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const { toast } = useToast();

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, 
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animated-element');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Handle form submissions
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, formType: string) => {
    e.preventDefault();
    toast({
      title: "Form Submitted",
      description: `Your ${formType} information has been received. We'll be in touch soon.`,
    });
    // Reset the form
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-bama-blue">
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),rgba(15,23,42,1)_70%)]"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1631732337483-c45af353a154?q=80&w=2070')] bg-center bg-cover"></div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-8 w-8 text-white/70" />
        </div>
        <div className="z-10 text-center max-w-4xl px-4 animated-element">
          <div className="mb-8 flex justify-center">
            <Logo className="w-32 h-32" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Bulgarian Additive Manufacturing Association</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">Innovating Together. Competing Globally.</p>
          <Button className="bama-gradient text-white px-6 py-3 rounded-full text-lg hover:shadow-lg transition-all" asChild>
            <a href="#membership">Become a Member</a>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-bama-blue to-bama-dark">
        <div className="section-container">
          <h2 className="section-title text-white animated-element">About BAMA</h2>
          <div className="max-w-3xl animated-element">
            <p className="text-gray-300 leading-relaxed mb-6">
              The Bulgarian Additive Manufacturing Association (BAMA) was established to address the pressing need for structured collaboration within Bulgaria's growing 3D printing ecosystem. As the industry evolves rapidly, we provide a neutral, non-commercial platform that fosters innovation and strategic growth.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our focus is on the future of Industry 4.0 in Bulgaria, bringing together manufacturers, researchers, educational institutions, and technology innovators to create a thriving environment for additive manufacturing excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="mission" className="py-20 bg-bama-dark">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animated-element">
              <h2 className="section-title text-white">Our Vision</h2>
              <div className="glassmorphism p-6 rounded-lg h-full">
                <p className="text-gray-300 leading-relaxed">
                  To unify and amplify the Bulgarian additive manufacturing sector's capabilities in the global arena, establishing Bulgaria as a recognized center of excellence for 3D printing innovation and implementation.
                </p>
              </div>
            </div>
            <div className="animated-element">
              <h2 className="section-title text-white">Our Mission</h2>
              <div className="glassmorphism p-6 rounded-lg">
                <ul className="text-gray-300 space-y-4">
                  <li className="flex items-start">
                    <span className="mr-2 text-bama-electric-blue">•</span>
                    <span>Facilitate collaboration between companies, researchers, and institutions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-bama-electric-blue">•</span>
                    <span>Advocate for technological progress and regulatory support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-bama-electric-blue">•</span>
                    <span>Promote innovation and excellence in 3D manufacturing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-bama-electric-blue">•</span>
                    <span>Build international partnerships to bring global best practices to Bulgaria</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Objectives Section */}
      <section id="objectives" className="py-20 bg-gradient-to-b from-bama-dark to-bama-blue">
        <div className="section-container">
          <h2 className="section-title text-white animated-element">Core Objectives</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                icon: <MessageSquare className="h-10 w-10" />,
                title: "Strengthen Communication",
                description: "Foster dialogue and knowledge sharing between 3D printing companies across Bulgaria."
              },
              {
                icon: <Rocket className="h-10 w-10" />,
                title: "Support Startups",
                description: "Provide visibility, mentorship and guidance to emerging additive manufacturing ventures."
              },
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: "Promote Open Innovation",
                description: "Create joint ventures with AI, aerospace, automotive, medical, and educational sectors."
              },
              {
                icon: <LineChart className="h-10 w-10" />,
                title: "Stimulate Market Development",
                description: "Drive growth through strategic events, policy dialogue and international partnerships."
              }
            ].map((objective, index) => (
              <Card key={index} className="glassmorphism border-none animated-element">
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bama-gradient mb-4 text-white">
                    {objective.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{objective.title}</h3>
                  <p className="text-gray-300">{objective.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Member Benefits Section */}
      <section id="membership" className="py-20 bg-bama-blue">
        <div className="section-container">
          <h2 className="section-title text-white animated-element">Member Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: <Brain className="h-10 w-10" />,
                title: "Industry Insights",
                description: "Access to exclusive reports, market analysis, and additive manufacturing trends."
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Networking Opportunities",
                description: "Connect with peers, institutions, and potential clients or partners."
              },
              {
                icon: <Calendar className="h-10 w-10" />,
                title: "Priority Event Access",
                description: "Get early registration and special rates for BAMA-hosted conferences and workshops."
              },
              {
                icon: <Globe className="h-10 w-10" />,
                title: "EU Project Participation",
                description: "Eligibility to join BAMA-coordinated EU-funded consortiums and projects."
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: "Marketing Exposure",
                description: "Shared promotional opportunities through BAMA's platforms and media partnerships."
              },
              {
                icon: <MessageSquare className="h-10 w-10" />,
                title: "Industry Voice",
                description: "Represent the sector's interests in policy discussions and regulatory frameworks."
              }
            ].map((benefit, index) => (
              <Card key={index} className="bg-bama-dark/50 border border-bama-electric-blue/20 animated-element hover:border-bama-electric-blue/50 transition-all">
                <div className="p-6 flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="text-bama-electric-blue mr-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Conference Section */}
      <section id="events" className="py-20 bg-gradient-to-b from-bama-blue to-bama-dark">
        <div className="section-container">
          <h2 className="section-title text-white animated-element">Upcoming Events</h2>
          <div className="bg-bama-dark/80 p-8 rounded-lg border border-bama-electric-blue/30 max-w-4xl mx-auto animated-element">
            <h3 className="text-2xl font-bold text-white mb-2">Founding Conference of BAMA</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bama-gradient text-white px-3 py-1 rounded-full text-sm">Date: TBA</div>
              <div className="bama-gradient text-white px-3 py-1 rounded-full text-sm">Location: Sofia, Bulgaria</div>
            </div>
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-bama-electric-blue mb-3">Topics Preview:</h4>
              <ul className="text-gray-300 grid md:grid-cols-2 gap-3">
                <li className="flex items-center">
                  <span className="mr-2 text-bama-neon-green">•</span>
                  <span>Industry trends & market opportunities</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-bama-neon-green">•</span>
                  <span>AI applications in 3D printing</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-bama-neon-green">•</span>
                  <span>Education & workforce readiness</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-bama-neon-green">•</span>
                  <span>Cross-sector collaboration initiatives</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-bama-dark/80 p-6 rounded-lg border border-bama-electric-blue/20">
              <h4 className="text-xl font-semibold text-white mb-4">Pre-register your interest</h4>
              <form onSubmit={(e) => handleFormSubmit(e, "event registration")}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Input 
                      placeholder="Full Name" 
                      className="bg-bama-dark border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Email Address" 
                      className="bg-bama-dark border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Input 
                    placeholder="Organization & Role" 
                    className="bg-bama-dark border-bama-gray/30 text-white"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bama-gradient text-white"
                >
                  Pre-register Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Partner With Us Section */}
      <section id="partner" className="py-20 bg-bama-dark">
        <div className="section-container">
          <h2 className="section-title text-white animated-element">Partner With Us</h2>
          <div className="grid md:grid-cols-2 gap-12 mt-8">
            <div className="animated-element">
              <p className="text-gray-300 leading-relaxed mb-6">
                BAMA invites companies, universities, research institutions, and organizations involved in additive manufacturing to join our network. Together, we can accelerate innovation, share knowledge, and strengthen Bulgaria's position in the global 3D printing landscape.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our partners benefit from collaborative opportunities, shared resources, access to specialized expertise, and a wider platform for visibility and impact.
              </p>
            </div>
            <div className="glassmorphism p-6 rounded-lg animated-element">
              <h3 className="text-xl font-semibold text-white mb-4">Express Your Interest</h3>
              <form onSubmit={(e) => handleFormSubmit(e, "partnership request")}>
                <div className="space-y-4">
                  <div>
                    <Input 
                      placeholder="Company/Organization Name" 
                      className="bg-transparent border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder="Contact Person" 
                      className="bg-transparent border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Email Address" 
                      className="bg-transparent border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Textarea 
                      placeholder="Why you want to partner with BAMA" 
                      className="bg-transparent border-bama-gray/30 text-white resize-none h-32"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="partnership-terms" required />
                    <label
                      htmlFor="partnership-terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                    >
                      I agree to BAMA contacting me about this partnership request
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="bama-gradient text-white w-full"
                  >
                    Submit Partnership Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-bama-dark to-black">
        <div className="section-container">
          <h2 className="section-title text-white animated-element">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12 mt-8">
            <div className="animated-element">
              <div className="flex items-center mb-6">
                <Mail className="text-bama-electric-blue mr-4 h-6 w-6" />
                <a href="mailto:info@bama.bg" className="text-gray-300 hover:text-white transition-colors">
                  info@bama.bg
                </a>
              </div>
              <p className="text-gray-300 mb-6">
                Have questions about BAMA or interested in learning more about our initiatives? 
                Send us a message and our team will get back to you as soon as possible.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-bama-electric-blue hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="#" className="text-bama-electric-blue hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="glassmorphism p-6 rounded-lg animated-element">
              <h3 className="text-xl font-semibold text-white mb-4">Send a Message</h3>
              <form onSubmit={(e) => handleFormSubmit(e, "contact")}>
                <div className="space-y-4">
                  <div>
                    <Input 
                      placeholder="Full Name" 
                      className="bg-transparent border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Email Address" 
                      className="bg-transparent border-bama-gray/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Textarea 
                      placeholder="Your Message" 
                      className="bg-transparent border-bama-gray/30 text-white resize-none h-32"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                    >
                      I consent to BAMA processing my data in accordance with GDPR
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="bama-gradient text-white w-full"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black text-gray-400 text-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-4">
            <Logo className="w-16 h-16" />
          </div>
          <p>© {new Date().getFullYear()} Bulgarian Additive Manufacturing Association. All rights reserved.</p>
          <p className="mt-2 text-sm">
            <a href="#" className="hover:text-bama-electric-blue transition-colors">Privacy Policy</a> • 
            <a href="#" className="hover:text-bama-electric-blue transition-colors ml-2">Terms of Use</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
