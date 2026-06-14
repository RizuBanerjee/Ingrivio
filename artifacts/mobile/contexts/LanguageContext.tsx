import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STRINGS, type Language, type StringKey } from "@/constants/strings";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: StringKey) => string;
}

const defaultT = (key: StringKey): string => STRINGS.en[key] ?? key;

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: defaultT,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem("ingrivio_language")
      .then((l) => {
        if (l === "en" || l === "hi") setLang(l);
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    AsyncStorage.setItem("ingrivio_language", lang).catch(() => {});
  }, []);

  const t = useCallback(
    (key: StringKey): string => STRINGS[language][key] ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
