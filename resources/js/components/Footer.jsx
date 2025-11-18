export default function Footer() {
    return (
        <footer className="py-10 text-center text-gray-300 border-t border-gray-800 mt-10 bg-black/40">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">JOOD</h3>
                        <p className="text-sm text-gray-400">
                            Smart Cooking Assistant — ©{" "}
                            {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="flex gap-6 text-sm">
                        <a href="/about" className="hover:text-green-400">
                            About
                        </a>
                        <a href="/contact" className="hover:text-green-400">
                            Contact
                        </a>
                        <a href="/privacy" className="hover:text-green-400">
                            Privacy
                        </a>
                    </div>

                    <div className="text-sm opacity-80">
                        Powered by AI • JOOD
                    </div>
                </div>
            </div>
        </footer>
    );
}
