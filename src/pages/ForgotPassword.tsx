import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { FooterSection } from "@/components/ui/footer-section";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, X, ArrowLeft, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
      toast({
        title: t("auth.forgotPassword.success.title") || "Reset Email Sent",
        description: t("auth.forgotPassword.success.description") || "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      const errorMessage = error.message || t("auth.forgotPassword.error.description") || "Failed to send reset email. Please check your email address and try again.";
      toast({
        title: t("auth.forgotPassword.error.title") || "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("auth.back") || "Back to Login"}
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
              <CardTitle className="text-3xl font-bold">
                {t("auth.forgotPassword.title") || "Forgot Password"}
              </CardTitle>
              <CardDescription>
                {isSuccess 
                  ? t("auth.forgotPassword.success.description") || "Please check your email for password reset instructions."
                  : t("auth.forgotPassword.description") || "Enter your email address and we'll send you a link to reset your password."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-muted-foreground">
                    {t("auth.forgotPassword.success.description") || "Please check your email for password reset instructions."}
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate("/login")}
                      className="w-full rounded-full"
                    >
                      {t("auth.forgotPassword.backToLogin") || "Back to Login"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSuccess(false);
                        setEmail("");
                      }}
                      className="w-full rounded-full"
                    >
                      {t("auth.forgotPassword.sendAnother") || "Send Another Email"}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("auth.forgotPassword.email.label") || "Email Address"}
                    </Label>
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
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-full" 
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading 
                      ? (t("auth.loading") || "Loading...") 
                      : (t("auth.forgotPassword.submit") || "Send Reset Link")
                    }
                  </Button>
                </form>
              )}

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {t("auth.hasAccount") || "Remember your password? "}
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

export default ForgotPassword;

