// src/pages/contact/ContactPage.jsx

import ContactHero from "./ContactHero";
import ContactForm from "./ContactForm";

export default function ContactPagePublic() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0a1628 0%, #0f2545 55%, #162d5a 100%)",
            }}
        >
            <ContactHero />
            <ContactForm />
        </div>
    );
}
