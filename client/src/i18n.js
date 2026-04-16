import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    supportedLngs: ["en", "es"],
    fallbackLng: "en",
    resources: {
      en: {
        translation: {
          welcome: "Welcome back to DevTrust",
          login_title: "DevTrust Pro",
          login_subtitle: "Elevating your freelance journey.",
          email_placeholder: "Modern email address",
          password_placeholder: "Secure password",
          sign_in_button: "Sign In Securely",
          google_button: "Direct Access with Google",
          new_here: "New to the ecosystem?",
          create_account: "Initialize Account"
        }
      },
      es: {
        translation: {
          welcome: "Bienvenido a DevTrust",
          login_title: "DevTrust Pro",
          login_subtitle: "Elevando su viaje como freelancer.",
          email_placeholder: "Dirección de correo moderna",
          password_placeholder: "Contraseña segura",
          sign_in_button: "Iniciar sesión de forma segura",
          google_button: "Acceso directo con Google",
          new_here: "¿Nuevo en el ecosistema?",
          create_account: "Inicializar cuenta"
        }
      }
    },
    detection: {
      order: ["path", "cookie", "htmlTag", "localStorage", "subdomain"],
      caches: ["cookie"],
    },
  });

export default i18n;
