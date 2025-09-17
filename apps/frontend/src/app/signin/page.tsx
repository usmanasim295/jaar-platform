"use client";
import React from "react";
import Image from "next/image";
import SigninForm from "@/components/forms/SigninForm";
import { useTranslation } from "react-i18next";
import { RouteProtection } from "@/components/RouteProtection";

const page = () => {
  const { t } = useTranslation();

  return (
    <RouteProtection requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center " dir="ltr">
        <title>{t("Sign In")}</title>
      <div className="w-full h-[-webkit-fill-available] flex">
        {/*  Form */}
        <div className="w-1/2 py-6 pl-12 pr-2 pt-[100px] flex flex-col">
          <Image
            src="/assets/icons/SiteLogo.svg"
            width={117}
            height={124}
            alt="JAR logo"
            className="mb-12"
          />
          <div className="mb-8">
            <h1 className="font-bold typo-heading2 mb-3 font-anevir ">
              {t("Sign In")}
            </h1>
            <p className="typo-body text-(--grey-text) font-jakarta">
              {t("Please provide details to sign in")}
            </p>
          </div>
          <SigninForm />
        </div>

        <div className="sticky top-0 left-0 w-1/2 h-[100vh] sm:block hidden">
          <div className="relative w-full h-full">
            <Image
              src="/assets/SignupImage.png"
              alt="image"
              fill
              className="object-cover object-left"
            />
          </div>
        </div>
      </div>
      </div>
    </RouteProtection>
  );
};

export default page;
