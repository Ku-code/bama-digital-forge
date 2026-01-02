import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { FooterSection } from "@/components/ui/footer-section";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Lock, X, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery token in the URL
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      setIsValidToken(true);
      // Set the session with the recovery token
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      }).catch((error) => {
        console.error('Error setting session:', error);
        setIsValidToken(false);
        toast({
          title: t("auth.resetPassword.error.title") || "Invalid Link",
          description: t("auth.resetPassword.error.invalidLink") || "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
      });
    } else {
      setIsValidToken(false);
      toast({
        title: t("auth.resetPassword.error.title") || "Invalid Link",
        description: t("auth.resetPassword.error.invalidLink") || "This password reset link is invalid or has expired. Please request a new one.",
        variant: "destructive",
      });
    }
  }, [location, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t("auth.resetPassword.error.title") || "Validation Error",
        description: t("auth.register.error.passwordMatch") || "Passwords do not match. Please make sure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t("auth.resetPassword.error.title") || "Validation Error",
        description: t("auth.resetPassword.error.passwordLength") || "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: t("auth.resetPassword.success.title") || "Password Reset Successful",
        description: t("auth.resetPassword.success.description") || "Your password has been successfully reset. You can now login with your new password.",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || t("auth.resetPassword.error.description") || "Failed to reset password. Please try again or request a new reset link.";
      toast({
        title: t("auth.resetPassword.error.title") || "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken && !isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="border-2">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold">
                  {t("auth.resetPassword.error.title") || "Invalid Link"}
                </CardTitle>
                <CardDescription>
                  {t("auth.resetPassword.error.invalidLink") || "This password reset link is invalid or has expired."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/forgot-password">
                  <Button className="w-full rounded-full">
                    {t("auth.forgotPassword.title") || "Request New Reset Link"}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full rounded-full">
                    {t("auth.forgotPassword.backToLogin") || "Back to Login"}
                  </Button>
                </Link>
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
  }

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
                {isSuccess 
                  ? t("auth.resetPassword.success.title") || "Password Reset"
                  : t("auth.resetPassword.title") || "Reset Password"
                }
              </CardTitle>
              <CardDescription>
                {isSuccess 
                  ? t("auth.resetPassword.success.description") || "Your password has been successfully reset. Redirecting to login..."
                  : t("auth.resetPassword.description") || "Enter your new password below."
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
                    {t("auth.resetPassword.success.description") || "Your password has been successfully reset. Redirecting to login..."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {t("auth.resetPassword.newPassword.label") || "New Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.password.placeholder") || "Enter your new password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 rounded-full"
                        required
                        autoComplete="new-password"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 rounded-full hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("auth.resetPassword.confirmPassword.label") || "Confirm Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth.password.confirm.placeholder") || "Confirm your new password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 rounded-full"
                        required
                        autoComplete="new-password"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 rounded-full hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-full" 
                    disabled={isLoading}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {isLoading 
                      ? (t("auth.loading") || "Loading...") 
                      : (t("auth.resetPassword.submit") || "Reset Password")
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

export default ResetPassword;

