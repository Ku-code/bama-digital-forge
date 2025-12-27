import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { DollarSign } from "lucide-react";

const BudgetContent = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-6 w-6" />
        <h2 className="text-2xl font-bold">{t("dashboard.budget.title") || "Budget & Financials"}</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.budget.overview") || "Budget Overview"}</CardTitle>
          <CardDescription>
            {t("dashboard.budget.description") || "View financial information and budget details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("dashboard.budget.empty") || "No budget information available."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetContent;

