"use client";

import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import PhoneNumberInput from "../ui/PhoneNumberInput.tsx";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSignUpMutation } from "@/store/api";
import type { Language } from "@/types/api";
import i18n from "@/i18n";
import { useEffect } from "react";
import Link from "next/link";

type SignupFormDataa = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

const SignupForm = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormDataa>();
  const router = useRouter();
  const [signUp, { isLoading, error }] = useSignUpMutation();

  const onSubmit = async (data: SignupFormDataa) => {
    try {
      const res = await signUp({
        body: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
        },
        lang: i18n.language as Language,
      }).unwrap();

      console.log("User Registered:", res);
      
      // Store service provider data for profile setup
      localStorage.setItem("serviceProviderId", res.serviceProvider?.id);
      localStorage.setItem("name", JSON.stringify(res.serviceProvider?.name));
      
      // Clear any existing auth data to ensure fresh signup flow
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect to profile setup
      router.push("/profile-setup");
    } catch (err: any) {
      console.error("Signup failed:", err?.data || err);
    }
  };

  const password = watch("password");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, []);
  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full font-jakarta max-w-[424px]"
      >
        <InputField
          name="name"
          control={control}
          type="text"
          placeholder={t("Name")}
          inputClassName="h-[60px]"
          placeholderAnimate
          rules={{ required: t("Name is required") }}
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(
              /[^A-Za-z\s]/g,
              "",
            );
          }}
          error={errors.name?.message}
        />

        <InputField
          name="email"
          control={control}
          type="email"
          placeholder={t("Email")}
          inputClassName="h-[60px]"
          placeholderAnimate
          rules={{
            required: t("Email is required"),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t("Enter a valid email address"),
            },
            minLength: {
              value: 5,
              message: t("Email must be at least 5 characters"),
            },
            maxLength: {
              value: 50,
              message: t("Email must not exceed 50 characters"),
            },
          }}
          error={errors.email?.message}
        />

        <PhoneNumberInput
          name="phoneNumber"
          control={control}
          placeholder={t("Phone Number")}
          inputClassName="h-[60px]"
          rules={{
            required: t("Phone number is required"),
            validate: (value) =>
              value && value.length > 8 ? true : t("Enter a valid phone number"),
          }}
          error={errors.phoneNumber?.message}
        />

        <InputField
          name="password"
          control={control}
          type="password"
          placeholder={t("Password")}
          inputClassName="h-[60px]"
          placeholderAnimate
          rules={{
            required: t("Password is required"),
            pattern: {
              value:
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{6,}$/,
              message: t(
                t("Use 6+ characters with uppercase, number, and special symbol"),
              ),
            },
          }}
          error={errors.password?.message}
        />

        <InputField
          name="confirmPassword"
          control={control}
          type="password"
          placeholder={t("Confirm Password")}
          inputClassName="h-[60px]"
          placeholderAnimate
          rules={{
            required: t("Confirm your password"),
            validate: (value) =>
              value === password || t("Password does not match"),
          }}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6 font-anevir flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white" />
          ) : (
            t("Sign Up")
          )}
        </Button>

        {error && (
          <p className="text-red-500 text-sm">
            {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data ? 
             (error.data as any).message : 
             'message' in error ? (error as any).message :
             t("Something went wrong please try again")}
          </p>
        )}

        {/* <div className="text-center mt-1">
          <p className="text-sm text-gray-600 font-jakarta">
            {t("Already have an account?")}{" "}
            <button
              type="button"
              onClick={() => router.push("/signin")}
              className="text-[#2d6a87] font-medium"
            >
              {t("Sign in")}
            </button>
          </p>
        </div> */}
        <div className=" text-center">
          <p className="text-sm text-gray-600 font-jakarta">
            {t("Already have an account?")}{' '}
            <Link href="/signin" className="text-[#2d6a87] font-medium">
              {t('Sign in')}
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default SignupForm;
