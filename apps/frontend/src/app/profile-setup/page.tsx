"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import dynamic from "next/dynamic";
import { CaretLeft } from "@/components/assets/icons";
import { useTranslation } from "react-i18next";
import { Bounce, toast, ToastContainer } from "react-toastify";

const steps = [
  dynamic(() => import("./Steps/FirstStep")),
  dynamic(() => import("./Steps/SecondStep")),
  dynamic(() => import("./Steps/ThirdStep")),
  dynamic(() => import("./Steps/FourthStep")),
  dynamic(() => import("./Steps/FifthStep")),
  dynamic(() => import("./Steps/SixthStep")),
  dynamic(() => import("./Steps/SevenStep")),
];

const initialStepData = {
  first: {},
  second: {},
  third: {},
  fourth: {},
  fifth: {},
  sixth: {},
  seven: {},
};

const Page = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState(initialStepData);
  const [loading, setLoading] = useState(false);

  const StepComponent = steps[currentStep];

  const stepProps = {
    data: stepData,
    setData: (key: string, value: any) =>
      setStepData((prev) => ({
        ...prev,
        [key as keyof typeof initialStepData]: value,
      })),
  };

  const stepRefs = useRef<any[]>([]);

  const handleNext = async () => {
    const stepRef = stepRefs.current[currentStep];
    const StepComponent = steps[currentStep];

    if (currentStep !== 0) {
      if (stepRef?.submit) {
        setLoading(true);
        const success = await stepRef.submit();
        setLoading(false);
        if (!success) {
          if (currentStep == 2) {
            toast("Please Select atleast 1 or more", {
              position: "top-left",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              transition: Bounce,
            });
          } else {
            toast("Please complete the current step before proceeding.", {
              position: "top-left",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
              transition: Bounce,
            });
          }
          return;
        }
      }

      // Check if step is complete (if the component has an isComplete method)
      if (StepComponent && typeof (StepComponent as any).isComplete === 'function') {
        const stepKeys = [
          "first",
          "second",
          "third",
          "fourth",
          "fifth",
          "sixth",
          "seven",
        ];
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Profile setup completed
      // Clear the service provider ID as it's no longer needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem("serviceProviderId");
        localStorage.removeItem("name");
        localStorage.removeItem("selectedServices");
        localStorage.removeItem("selectedServicesName");
      }
      
      // Redirect to signin page to complete authentication
      router.push("/signin");
    }
  };

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    const serviceProviderId = localStorage.getItem("serviceProviderId");
    const token = localStorage.getItem("token");
    
    // If user is already fully authenticated, redirect to main page
    if (token && !serviceProviderId) {
      router.push("/");
      return;
    }
    
    // If no service provider ID (not in signup flow), redirect to signup
    if (!serviceProviderId) {
      router.push("/signup");
    }
  }, [router]);
  return (
    <div className="py-2.5 bg-(--white) w-full flex flex-col justify-between mt-12.5 h-[calc(100vh-140px)]">
      <title>Profile Setup</title>
      <div className="w-full flex justify-center px-10 ">
        <div className="w-full max-w-[1300px] flex flex-col justify-between mb-40">
          <StepComponent
            ref={(el: any) => (stepRefs.current[currentStep] = el)}
            {...stepProps}
          />
        </div>
      </div>

      <div className="fixed bottom-4 w-screen inset-x-0 bg-white">
        <div className="relative w-full h-2 bg-(--light-grey) mb-8">
          <div
            className="absolute h-2 bg-(--primary) rounded-r-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="w-full flex justify-center px-10">
          <div className="w-full flex max-w-[1300px] justify-between items-center">
            <Button
              variant="secondary"
              className="flex items-center gap-[5px] py-[19px] pl-2 pr-6 font-semibold font-anevir"
              onClick={() => {
                if (currentStep === 0) router.push("/signup");
                else setCurrentStep((s) => Math.max(s - 1, 0));
              }}>
              <CaretLeft />
              {t("Previous")}
            </Button>

            <Button
              variant="primary"
              className="flex items-center gap-[5px] py-[19px] px-8 font-semibold font-anevir"
              onClick={handleNext}>
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white" />
              ) : (
                t("Next")
              )}
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;
