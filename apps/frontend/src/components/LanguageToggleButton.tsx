"use client";

import { useTranslation } from "react-i18next";
import { useEffect, FC, useState } from "react";
interface LanguageToggleButtonProps {
  skipRTLPage?: boolean;
}
interface LanguageButtonProps {
  i18n: ReturnType<typeof useTranslation>["i18n"];
  lng: string;
  label: string;
}
const LanguageButton: FC<LanguageButtonProps> = ({ i18n, lng, label }) => {
  const isCurrent = i18n.language === lng;
  const { t } = useTranslation();
  return (
    <button
      disabled={isCurrent}
      onClick={() => !isCurrent && i18n.changeLanguage(lng)}
      className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ease-in-out ${
        isCurrent
          ? "bg-(--primary) text-white cursor-default"
          : "text-[var(--primary-black)] hover:bg-gray-200 cursor-pointer"
      }`}
    >
      {t(label)}
    </button>
  );
};
const LanguageToggleButton: FC<LanguageToggleButtonProps> = ({
  skipRTLPage = false,
}) => {
  const { i18n } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!i18n.language) {
      i18n.changeLanguage("en");
    }
    setLoaded(true);
  }, [i18n]);
  useEffect(() => {
    if (!loaded) return;

    const dir = skipRTLPage || i18n.language === "en" ? "ltr" : "rtl";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language, skipRTLPage, loaded]);

  if (!loaded) return null;
  return (
    <div
      className={`flex items-center lg:gap-4 ${
        i18n.language === "ar" && !skipRTLPage ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex bg-[var(--light-grey)] rounded-full shadow-inner font-semibold font-jakarta ${
          i18n.language === "ar" && !skipRTLPage ? "flex-row-reverse" : ""
        }`}
      >
        <LanguageButton i18n={i18n} lng="en" label="ENGLISH" />
        <LanguageButton i18n={i18n} lng="ar" label="العربية" />
      </div>
    </div>
  );
};

export default LanguageToggleButton;
