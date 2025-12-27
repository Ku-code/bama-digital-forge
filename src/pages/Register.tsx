import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { FooterSection } from "@/components/ui/footer-section";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { decodeJWT } from "@/lib/jwt";
import { UserPlus, Mail, Lock, User, X, ArrowLeft } from "lucide-react";

const Register = () => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t("auth.register.error.title") || "Error",
        description: t("auth.register.error.passwordMatch") || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate registration - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      // Create user object from form data
      const userData = {
        id: `email_${Date.now()}`,
        name: name,
        email: email,
        provider: 'email' as const,
      };
      login(userData);
      toast({
        title: t("auth.register.success.title") || "Registration Successful",
        description: t("auth.register.success.description") || "Your account has been created successfully!",
      });
      navigate("/dashboard");
    }, 1000);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google Registration Success:", credentialResponse);
    
    // Decode JWT token to get user info
    if (credentialResponse.credential) {
      const decoded = decodeJWT(credentialResponse.credential);
      if (decoded) {
        const userData = {
          id: decoded.sub || `google_${Date.now()}`,
          name: decoded.name || decoded.given_name || 'User',
          email: decoded.email || '',
          image: decoded.picture,
          provider: 'google' as const,
        };
        login(userData);
        toast({
          title: t("auth.register.success.title") || "Registration Successful",
          description: t("auth.google.success") || "Successfully registered with Google!",
        });
        navigate("/dashboard");
      }
    }
  };

  const handleGoogleError = () => {
    toast({
      title: t("auth.google.error.title") || "Registration Failed",
      description: t("auth.google.error.description") || "Failed to register with Google. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("auth.back") || "Back to Home"}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Card className="border-2">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold">{t("auth.register.title") || "Register"}</CardTitle>
              <CardDescription>
                {t("auth.register.description") || "Create a new account to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                size="large"
                text="signup_with"
                shape="rectangular"
                locale={language === "bg" ? "bg" : "en"}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t("auth.or") || "Or continue with"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("auth.name") || "Full Name"}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("auth.name.placeholder") || "John Doe"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 rounded-full"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email") || "Email"}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.email.placeholder") || "name@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-full"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("auth.password") || "Password"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("auth.password.placeholder") || "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-full"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("auth.password.confirm") || "Confirm Password"}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t("auth.password.confirm.placeholder") || "Confirm your password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 rounded-full"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full rounded-full" 
                  disabled={isLoading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? (t("auth.loading") || "Loading...") : (t("auth.register.button") || "Register")}
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {t("auth.hasAccount") || "Already have an account? "}
                </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t("auth.login.link") || "Login"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FooterSection
        translations={{}}
        socialLinks={{}}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );
};

export default Register;
