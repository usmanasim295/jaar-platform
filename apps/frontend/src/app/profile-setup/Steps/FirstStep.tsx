import React, { useState } from "react";
import Image from "next/image";
import { StepProps } from "../types";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const FirstStep = ({ data, setData }: StepProps) => {
  const { t } = useTranslation();
  const [isComplete, setIsComplete] = useState(true);
  const name = localStorage.getItem("name");  

  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist typo-heading1 font-bold mb-8">
        {t("Hey")} {name ?JSON.parse(name) : ''}{" "}
        {t("just need some information to complete sign up process.")}
      </h1>
      <div className="flex flex-wrap gap-6">
        <div className="bg-(--light-grey) rounded-2xl p-4 overflow-hidden w-[48%]">
          <Image
            src={"/assets/icons/User.svg"}
            width={32}
            height={32}
            alt="user"
            className="mb-4"
          />
          <p className="text-(--black) typo-body font-jakarta">
            {t("Answer a few questions an start building your profile.")}
          </p>
        </div>
        <div className="bg-(--light-grey) rounded-2xl p-4 overflow-hidden w-[48%]">
          <Image
            src={"/assets/icons/Files.svg"}
            width={32}
            height={32}
            alt="files"
            className="mb-4"
          />
          <p className="text-(--black) typo-body font-jakarta">
            {t("Apply for open jobs by HOA’s or list your service.")}
          </p>
        </div>
        <div className="bg-(--light-grey) rounded-2xl p-4 overflow-hidden flex items-center gap-4 w-full">
          <Image
            src={"/assets/icons/Coin.svg"}
            width={32}
            height={32}
            alt="files"
          />
          <p className="text-(--black) typo-body font-jakarta">
            {t(
              "Jar ensures safe, seamless payments with support always ready to help."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
FirstStep.isComplete = (stepData: any) => {
  return !!stepData.first?.name;
};
export default FirstStep;
