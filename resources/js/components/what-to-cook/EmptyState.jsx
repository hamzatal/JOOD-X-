import { ChefHat } from "lucide-react";

export default function EmptyState({ lang, t }) {
    return (
        <div className="text-center py-20">
            <ChefHat className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
                {t("لم نجد وصفات مناسبة", "No recipes found")}
            </h3>
            <p className="text-gray-400">
                {t(
                    "جرب مكونات أخرى أو غير الخيارات",
                    "Try different ingredients or change options"
                )}
            </p>
        </div>
    );
}
