import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { X } from "lucide-react";

export default function Footer() {
    const { lang } = useLang();

    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    return (
        <>
            {/* FOOTER */}
            <footer
                className="py-10 text-center border-t border-gray-700/40 mt-10 
                bg-gray-900/40 backdrop-blur-xl shadow-inner"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* LEFT TEXT */}
                        <p className="text-sm text-gray-400">
                            {lang === "ar"
                                ? `مساعد الطبخ الذكي — © ${new Date().getFullYear()}`
                                : `Smart Cooking Assistant — © ${new Date().getFullYear()}`}
                        </p>

                        {/* LINKS */}
                        <div className="flex gap-6 text-sm">
                            <button
                                onClick={() => setShowTerms(true)}
                                className="hover:text-green-400 transition"
                            >
                                {lang === "ar" ? "الشروط والأحكام" : "Terms"}
                            </button>

                            <button
                                onClick={() => setShowPrivacy(true)}
                                className="hover:text-green-400 transition"
                            >
                                {lang === "ar" ? "سياسة الخصوصية" : "Privacy"}
                            </button>
                        </div>

                        {/* LOGO */}
                        <div className="opacity-90">
                            <img
                                src="/images/joodw.png"
                                alt="JOOD"
                                className="h-10 w-auto mx-auto opacity-90 hover:opacity-100 transition"
                            />
                        </div>
                    </div>
                </div>
            </footer>

            {/* ------------------------------- */}
            {/* TERMS POPUP */}
            {/* ------------------------------- */}
            {showTerms && (
                <PopupModal
                    title={
                        lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"
                    }
                    onClose={() => setShowTerms(false)}
                >
                    {lang === "ar" ? <TermsAR /> : <TermsEN />}
                </PopupModal>
            )}

            {/* ------------------------------- */}
            {/* PRIVACY POPUP */}
            {/* ------------------------------- */}
            {showPrivacy && (
                <PopupModal
                    title={lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                    onClose={() => setShowPrivacy(false)}
                >
                    {lang === "ar" ? <PrivacyAR /> : <PrivacyEN />}
                </PopupModal>
            )}
        </>
    );
}

/* ---------------------------
   POPUP COMPONENT
---------------------------- */
function PopupModal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-lg flex items-center justify-center p-6 animate-fadeIn">
            <div
                className="bg-gray-900/90 border border-gray-700/50 rounded-2xl shadow-2xl 
                w-full max-w-3xl max-h-[85vh] overflow-hidden animate-scaleIn"
            >
                {/* HEADER */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{title}</h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition p-2"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 text-gray-300 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ---------------------------
   TERMS (AR)
---------------------------- */
function TermsAR() {
    return (
        <div className="space-y-4 leading-relaxed">
            <h3 className="text-xl font-bold text-green-400">
                الشروط والأحكام
            </h3>

            <p>
                مرحبًا بك في منصة JOOD. باستخدامك لهذا الموقع فإنك توافق على
                جميع الشروط المذكورة هنا.
            </p>

            <p>
                يُمنع استخدام محتوى الموقع لأغراض غير قانونية أو إساءة
                الاستخدام، ويجب احترام حقوق الملكية الفكرية الخاصة بالمنصة.
            </p>

            <p>
                تحتفظ JOOD بحق تعديل أو تحديث أي بند من الشروط في أي وقت دون
                إشعار مسبق.
            </p>

            <p>
                استمرارك في استخدام الموقع يعني موافقتك على التعديلات المحدثة.
            </p>
        </div>
    );
}

/* ---------------------------
   TERMS (EN)
---------------------------- */
function TermsEN() {
    return (
        <div className="space-y-4 leading-relaxed">
            <h3 className="text-xl font-bold text-green-400">
                Terms & Conditions
            </h3>

            <p>
                Welcome to JOOD Platform. By accessing this website, you agree
                to all the terms listed here.
            </p>

            <p>
                Users are prohibited from using the website content for illegal
                purposes or violating intellectual property rights.
            </p>

            <p>
                JOOD reserves the right to modify, update, or change any part of
                the terms at any time without prior notice.
            </p>

            <p>
                Your continued use of the platform means you agree to the
                updated terms.
            </p>
        </div>
    );
}

/* ---------------------------
   PRIVACY (AR)
---------------------------- */
function PrivacyAR() {
    return (
        <div className="space-y-4 leading-relaxed">
            <h3 className="text-xl font-bold text-amber-400">سياسة الخصوصية</h3>

            <p>
                نحن في JOOD نلتزم بحماية خصوصيتك. يتم جمع البيانات الأساسية فقط
                لتحسين تجربة الاستخدام.
            </p>

            <p>
                لا نشارك بياناتك مع أي طرف ثالث دون إذنك، باستثناء الحالات
                القانونية الضرورية.
            </p>

            <p>يحق لك طلب حذف أو تعديل بياناتك في أي وقت.</p>
        </div>
    );
}

/* ---------------------------
   PRIVACY (EN)
---------------------------- */
function PrivacyEN() {
    return (
        <div className="space-y-4 leading-relaxed">
            <h3 className="text-xl font-bold text-amber-400">Privacy Policy</h3>

            <p>
                At JOOD, we are committed to protecting your privacy. Only
                essential data is collected to enhance user experience.
            </p>

            <p>
                We do not share your information with third parties unless
                legally required or with your explicit consent.
            </p>

            <p>
                You may request deletion or modification of your data at any
                time.
            </p>
        </div>
    );
}
