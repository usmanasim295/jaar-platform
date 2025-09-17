"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { StepProps } from "../types";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useUpdateProfileStepMutation } from "@/store/api";
import type { Language } from "@/types/api";
import Button from "../../../components/ui/Button";

const FifthStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(data?.fifth?.location || "");
  const [landmark, setLandmark] = useState(data?.fifth?.landmark || "");
  const [updateProfileStep, { error }] = useUpdateProfileStepMutation();

  useEffect(() => {
    setData("fifth", { location, landmark });
  }, [location, landmark, setData]);
  const handleSubmitStep5 = async () => {
    const id = localStorage.getItem("serviceProviderId");
    if (!id) {
      console.error("Service provider ID is missing!");
      return false;
    }
    const payload = {
      serviceProviderId: id,
      locations: [
        {
          city: location,
          state: landmark,
        },
      ],
    };

    try {
      const res = await updateProfileStep({
        step: 4,
        data: payload,
        lang: i18n.language as Language,
      }).unwrap();

      setData("fifth", { location, landmark });
      console.log("Step 5 success:", res);
      return true;
    } catch (err) {
      console.error("Step 5 failed:", err);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep5,
  }));

  return (
    <div>
      <h1 className="font-urbanist typo-heading1 font-bold mb-8 max-w-[667px] w-full">
        {t("Add the locations you cover to help us connect you with HOA’s")}
      </h1>

      <div className="w-full shadow-dark p-4 rounded-xl max-w-[648px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3629265.841639736!2d39.7831443!3d24.1307375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15e7b33fe7952a41%3A0x5960504bc21ab69b!2sSaudi%20Arabia!5e0!3m2!1sen!2ssa!4v1690196107614"
          height="145"
          className="mt-6 border-none rounded-2xl w-full"
        />
        <p className="mt-4 typo-body font-normal font-jakarta">
          Muheel Facilities Managment
        </p>
        <h3 className="mt-2 typo-body font-semibold mb-4 font-jakarta">
          Saudi Arabia
        </h3>

        <Button variant="inline" className="mb-6 font-jakarta">
          {t("Use my Current Location")}
        </Button>

        <h2 className="typo-label font-semibold mb-4 font-jakarta">
          {t("Add Manually")}
        </h2>

        <form>
          <div className="flex gap-4 font-jakarta">
            {/* Location Input */}
            <div className="bg-(--white) border-2 border-(--light-grey) rounded-[10px] px-4 py-3 overflow-hidden max-w-[300px] w-full">
              <p className="text-(--grey-text) typo-small font-jakarta font-regular mb-1">
                {t("Location")}
              </p>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-(--black) typo-body font-jakarta font-medium placeholder:text-(--black)"
                placeholder={t("Muheel Facilities Managment")}
              />
            </div>

            {/* Landmark Input */}
            <div className="bg-(--white) border-2 border-(--light-grey) rounded-[10px] px-4 py-3 overflow-hidden max-w-[300px] w-full">
              <p className="text-(--grey-text) typo-small font-jakarta font-regular mb-1">
                {t("Landmark")}
              </p>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-(--black) typo-body font-jakarta font-medium placeholder:text-(--black)"
                placeholder={t("Tea House")}
              />
            </div>
          </div>
        </form>
      </div>

      {error && (
        <p className="text-red-500 mt-2">{t("Failed to submit location")}</p>
      )}
    </div>
  );
});

export default FifthStep;
