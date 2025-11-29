import { useState } from "react";
import { useLang } from "@/context/LangContext";
import {
    X,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
    const { lang } = useLang();
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const isRTL = lang === "ar";

    return (
        <>
            {/* FOOTER */}
            <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black border-t border-gray-800/50 overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Column 1: Logo & Description */}
                        <div className="space-y-4">
                            <img
                                src="/images/joodw.png"
                                alt="JOOD"
                                className="h-12 w-auto"
                                onError={(e) =>
                                    (e.target.src = "/images/logo.png")
                                }
                            />
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {lang === "ar"
                                    ? "منصة الطبخ الذكية التي تساعدك في إعداد وجبات صحية ولذيذة بأسهل الطرق."
                                    : "Smart cooking platform that helps you prepare healthy and delicious meals the easiest way."}
                            </p>
                            <div className="flex gap-3">
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={18} />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition"
                                    aria-label="Twitter"
                                >
                                    <Twitter size={18} />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={18} />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-green-600 flex items-center justify-center text-gray-400 hover:text-white transition"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h3 className="text-white font-bold mb-4">
                                {lang === "ar" ? "روابط سريعة" : "Quick Links"}
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="/"
                                        className="text-gray-400 hover:text-green-400 transition flex items-center gap-2"
                                    >
                                        {lang === "ar" ? "الرئيسية" : "Home"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/recipes"
                                        className="text-gray-400 hover:text-green-400 transition flex items-center gap-2"
                                    >
                                        {lang === "ar" ? "الوصفات" : "Recipes"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/what-to-cook"
                                        className="text-gray-400 hover:text-green-400 transition flex items-center gap-2"
                                    >
                                        {lang === "ar"
                                            ? "شو اطبخ؟"
                                            : "What to Cook?"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/medical-recipes"
                                        className="text-gray-400 hover:text-green-400 transition flex items-center gap-2"
                                    >
                                        {lang === "ar"
                                            ? "وصفات صحية"
                                            : "Healthy Recipes"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/nutrition-blog"
                                        className="text-gray-400 hover:text-green-400 transition flex items-center gap-2"
                                    >
                                        {lang === "ar" ? "المدونة" : "Blog"}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Categories */}
                        <div>
                            <h3 className="text-white font-bold mb-4">
                                {lang === "ar" ? "الفئات" : "Categories"}
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="/recipes?category=Pasta"
                                        className="text-gray-400 hover:text-green-400 transition"
                                    >
                                        {lang === "ar" ? "باستا" : "Pasta"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/recipes?category=Vegetarian"
                                        className="text-gray-400 hover:text-green-400 transition"
                                    >
                                        {lang === "ar" ? "نباتي" : "Vegetarian"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/recipes?category=Desserts"
                                        className="text-gray-400 hover:text-green-400 transition"
                                    >
                                        {lang === "ar" ? "حلويات" : "Desserts"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/recipes?category=Beef"
                                        className="text-gray-400 hover:text-green-400 transition"
                                    >
                                        {lang === "ar" ? "لحم بقر" : "Beef"}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/recipes?category=Chicken"
                                        className="text-gray-400 hover:text-green-400 transition"
                                    >
                                        {lang === "ar" ? "دجاج" : "Chicken"}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div>
                            <h3 className="text-white font-bold mb-4">
                                {lang === "ar" ? "تواصل معنا" : "Contact Us"}
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-start gap-3">
                                    <Mail
                                        size={18}
                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                    />
                                    <a
                                        href="mailto:info@jood.com"
                                        className="hover:text-green-400 transition"
                                    >
                                        info@jood.com
                                    </a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Phone
                                        size={18}
                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                    />
                                    <a
                                        href="tel:0777777777"
                                        className="hover:text-green-400 transition"
                                        dir="ltr"
                                    >
                                        0777777777
                                    </a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin
                                        size={18}
                                        className="text-green-400 mt-0.5 flex-shrink-0"
                                    />
                                    <span>
                                        {lang === "ar" ? "الأردن" : "Jordan"}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 pt-6 mt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                            <p>
                                {lang === "ar"
                                    ? `© ${new Date().getFullYear()} JOOD. جميع الحقوق محفوظة.`
                                    : `© ${new Date().getFullYear()} JOOD. All rights reserved.`}
                            </p>

                            <div className="flex gap-6">
                                <button
                                    onClick={() => setShowTerms(true)}
                                    className="hover:text-green-400 transition"
                                >
                                    {lang === "ar"
                                        ? "الشروط والأحكام"
                                        : "Terms & Conditions"}
                                </button>
                                <button
                                    onClick={() => setShowPrivacy(true)}
                                    className="hover:text-green-400 transition"
                                >
                                    {lang === "ar"
                                        ? "سياسة الخصوصية"
                                        : "Privacy Policy"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* TERMS POPUP */}
            <AnimatePresence>
                {showTerms && (
                    <PopupModal
                        title={
                            lang === "ar"
                                ? "الشروط والأحكام"
                                : "Terms & Conditions"
                        }
                        onClose={() => setShowTerms(false)}
                        isRTL={isRTL}
                    >
                        {lang === "ar" ? <TermsAR /> : <TermsEN />}
                    </PopupModal>
                )}
            </AnimatePresence>

            {/* PRIVACY POPUP */}
            <AnimatePresence>
                {showPrivacy && (
                    <PopupModal
                        title={
                            lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"
                        }
                        onClose={() => setShowPrivacy(false)}
                        isRTL={isRTL}
                    >
                        {lang === "ar" ? <PrivacyAR /> : <PrivacyEN />}
                    </PopupModal>
                )}
            </AnimatePresence>
        </>
    );
}

/* POPUP COMPONENT */
function PopupModal({ title, children, onClose, isRTL }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
                dir={isRTL ? "rtl" : "ltr"}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-700"
                    >
                        <X size={24} />
                    </motion.button>
                </div>

                {/* Content */}
                <div className="p-6 text-gray-300 overflow-y-auto max-h-[calc(85vh-100px)] custom-scrollbar">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* TERMS (AR) */
function TermsAR() {
    return (
        <div className="space-y-6 leading-relaxed">
            <div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                    الشروط والأحكام
                </h3>
                <p className="text-gray-400 text-sm">
                    آخر تحديث: {new Date().toLocaleDateString("ar")}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        1. القبول والموافقة
                    </h4>
                    <p>
                        مرحبًا بك في منصة JOOD. باستخدامك لهذا الموقع، فإنك
                        توافق على جميع الشروط والأحكام المذكورة هنا. إذا كنت لا
                        توافق على أي من هذه الشروط، يُرجى عدم استخدام الموقع.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        2. استخدام المحتوى
                    </h4>
                    <p>
                        يُمنع منعًا باتًا استخدام محتوى الموقع لأغراض غير
                        قانونية أو مخالفة للقوانين المحلية والدولية. يجب احترام
                        حقوق الملكية الفكرية الخاصة بالمنصة وعدم إعادة نشر أو
                        توزيع المحتوى دون إذن كتابي مسبق.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        3. التعديلات والتحديثات
                    </h4>
                    <p>
                        تحتفظ JOOD بحق تعديل أو تحديث أي بند من الشروط في أي وقت
                        دون إشعار مسبق. استمرارك في استخدام الموقع بعد إجراء
                        التعديلات يعني موافقتك التامة على التحديثات الجديدة.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        4. المسؤولية
                    </h4>
                    <p>
                        نحن لا نتحمل أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة
                        قد تنتج عن استخدام الموقع أو عدم القدرة على استخدامه.
                        المعلومات المقدمة هي لأغراض تعليمية فقط.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        5. القانون الحاكم
                    </h4>
                    <p>
                        تخضع هذه الشروط والأحكام لقوانين المملكة العربية
                        السعودية، ويتم حل أي نزاعات في المحاكم المختصة.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* TERMS (EN) */
function TermsEN() {
    return (
        <div className="space-y-6 leading-relaxed">
            <div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">
                    Terms & Conditions
                </h3>
                <p className="text-gray-400 text-sm">
                    Last updated: {new Date().toLocaleDateString("en-US")}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        1. Acceptance and Agreement
                    </h4>
                    <p>
                        Welcome to JOOD Platform. By accessing this website, you
                        agree to all the terms and conditions listed here. If
                        you do not agree to any of these terms, please do not
                        use the website.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        2. Content Usage
                    </h4>
                    <p>
                        Users are strictly prohibited from using the website
                        content for illegal purposes or violating intellectual
                        property rights. All content must be respected and
                        cannot be republished or redistributed without prior
                        written permission.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        3. Modifications and Updates
                    </h4>
                    <p>
                        JOOD reserves the right to modify, update, or change any
                        part of these terms at any time without prior notice.
                        Your continued use of the platform after changes are
                        made constitutes your acceptance of the updated terms.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        4. Liability
                    </h4>
                    <p>
                        We do not accept any responsibility for any direct or
                        indirect damages resulting from the use or inability to
                        use the website. Information provided is for educational
                        purposes only.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        5. Governing Law
                    </h4>
                    <p>
                        These terms and conditions are governed by the laws of
                        Saudi Arabia, and any disputes shall be resolved in the
                        competent courts.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* PRIVACY (AR) */
function PrivacyAR() {
    return (
        <div className="space-y-6 leading-relaxed">
            <div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">
                    سياسة الخصوصية
                </h3>
                <p className="text-gray-400 text-sm">
                    آخر تحديث: {new Date().toLocaleDateString("ar")}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        1. جمع البيانات
                    </h4>
                    <p>
                        نحن في JOOD نلتزم بحماية خصوصيتك. يتم جمع البيانات
                        الأساسية فقط مثل الاسم والبريد الإلكتروني لتحسين تجربة
                        الاستخدام وتقديم خدمات أفضل.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        2. استخدام البيانات
                    </h4>
                    <p>
                        نستخدم بياناتك لتخصيص المحتوى، إرسال تحديثات مهمة،
                        وتحسين أداء المنصة. لا نستخدم بياناتك لأغراض تسويقية دون
                        موافقتك الصريحة.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        3. مشاركة البيانات
                    </h4>
                    <p>
                        لا نشارك بياناتك مع أي طرف ثالث دون إذنك، باستثناء
                        الحالات القانونية الضرورية أو عند الحاجة لتقديم الخدمة
                        (مثل معالجات الدفع الآمنة).
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        4. حقوقك
                    </h4>
                    <p>
                        يحق لك في أي وقت طلب الوصول إلى بياناتك الشخصية،
                        تعديلها، أو حذفها نهائيًا من قاعدة بياناتنا. يمكنك
                        التواصل معنا عبر البريد الإلكتروني لممارسة هذه الحقوق.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        5. الأمان
                    </h4>
                    <p>
                        نستخدم أحدث تقنيات التشفير والحماية لضمان سلامة بياناتك.
                        ومع ذلك، لا يمكن ضمان الأمان الكامل عبر الإنترنت، لذا
                        يُرجى استخدام كلمات مرور قوية وفريدة.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* PRIVACY (EN) */
function PrivacyEN() {
    return (
        <div className="space-y-6 leading-relaxed">
            <div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">
                    Privacy Policy
                </h3>
                <p className="text-gray-400 text-sm">
                    Last updated: {new Date().toLocaleDateString("en-US")}
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        1. Data Collection
                    </h4>
                    <p>
                        At JOOD, we are committed to protecting your privacy.
                        Only essential data such as name and email is collected
                        to enhance user experience and provide better services.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        2. Data Usage
                    </h4>
                    <p>
                        We use your data to personalize content, send important
                        updates, and improve platform performance. We do not use
                        your data for marketing purposes without your explicit
                        consent.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        3. Data Sharing
                    </h4>
                    <p>
                        We do not share your information with third parties
                        unless legally required or when necessary to provide
                        services (such as secure payment processors).
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        4. Your Rights
                    </h4>
                    <p>
                        You may request access to, modification of, or deletion
                        of your personal data at any time. You can contact us
                        via email to exercise these rights.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                        5. Security
                    </h4>
                    <p>
                        We use the latest encryption and protection technologies
                        to ensure your data safety. However, complete online
                        security cannot be guaranteed, so please use strong and
                        unique passwords.
                    </p>
                </div>
            </div>
        </div>
    );
}
