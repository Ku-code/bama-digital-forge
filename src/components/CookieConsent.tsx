import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show after a short delay for better UX
      setTimeout(() => {
        setShow(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl mb-2">
                  {t("cookies.consent.title") || "Cookie Consent"}
                </CardTitle>
                <CardDescription className="text-base">
                  {t("cookies.consent.description") || "We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking 'Accept', you consent to our use of cookies."}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
              onClick={handleReject}
              aria-label={t("cookies.consent.close") || "Close"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {t("cookies.consent.learnMore") || "Learn more about our "}
              <Link 
                to="/cookie-policy" 
                className="text-primary hover:underline font-medium"
              >
                {t("cookies.consent.policyLink") || "Cookie Policy"}
              </Link>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleReject}
                className="rounded-full flex-1 sm:flex-initial"
              >
                {t("cookies.consent.reject") || "Reject"}
              </Button>
              <Button
                onClick={handleAccept}
                className="rounded-full flex-1 sm:flex-initial"
              >
                {t("cookies.consent.accept") || "Accept All"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
