import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "bg";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("bg");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/50346ba1-6398-4d3a-b7ae-e83d28e057d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:20',message:'loadTranslations started',data:{language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      try {
        setIsLoading(true);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/50346ba1-6398-4d3a-b7ae-e83d28e057d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:23',message:'isLoading=true, starting import',data:{language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Add timeout to prevent infinite loading
        const importPromise = import(`../translations/${language}.json`);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Translation import timeout')), 5000)
        );
        
        const translationModule = await Promise.race([importPromise, timeoutPromise]) as any;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/50346ba1-6398-4d3a-b7ae-e83d28e057d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:32',message:'Translation import completed',data:{hasTranslations:!!translationModule?.default},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setTranslations(translationModule?.default || {});
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/50346ba1-6398-4d3a-b7ae-e83d28e057d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:35',message:'Translation import error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error("Error loading translations:", error);
        // Set empty translations as fallback to prevent infinite loading
        setTranslations({});
      } finally {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/50346ba1-6398-4d3a-b7ae-e83d28e057d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LanguageContext.tsx:41',message:'Setting isLoading=false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Dispatch language change event for favicon updates
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: newLanguage } 
    }));
  };

  const t = (key: string): string => {
    if (isLoading) {
      return ""; // Return empty string while loading
    }
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}; 