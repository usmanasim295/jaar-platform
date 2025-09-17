"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { StepProps } from "../types";
import { Currency } from "@/components/assets/icons";
import { useTranslation } from "react-i18next";
import { useSetServiceRatesMutation } from "@/store/api";
import type { Language } from "@/types/api";

const FourthStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const storedNames = localStorage.getItem("selectedServicesName");
  const storedIds = localStorage.getItem("selectedServices");
  const selectedServicesName: string[] = storedNames
    ? JSON.parse(storedNames)
    : [];
  const selectedServices: string[] = storedIds ? JSON.parse(storedIds) : [];
  const [rates, setRates] = useState<
    { serviceId: string; serviceName: string; rate: number }[]
  >(
    () =>
      data?.fourth?.serviceRates ||
      selectedServices.map((id, idx) => ({
        serviceId: id,
        serviceName: selectedServicesName[idx],
        rate: 500, // default
      })),
  );
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(
    null,
  );
  const [setServiceRates, { error }] = useSetServiceRatesMutation();
  const { t } = useTranslation();
  useEffect(() => {
    const id = localStorage.getItem("serviceProviderId");
    if (id) setServiceProviderId(id);
  }, []);
  const handleRateChange = (serviceName: string, value: string) => {
    setRates((prev) => {
      const updated = prev.map((r) =>
        r.serviceName === serviceName ? { ...r, rate: Number(value) } : r,
      );
      setData("fourth", { serviceRates: updated }); 
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!serviceProviderId || !rates.length) return false;

    const finalRates = rates.map((r) => ({
      serviceId: r.serviceId,
      rate: String(r.rate),
    }));

    try {
      const res = await setServiceRates({
        data: {
          serviceProviderId,
          serviceRates: finalRates,
        },
        lang: 'en' as Language,
      }).unwrap();

      setData("fourth", { serviceRates: rates });
      console.log("Step 4 success:", res);
      return true;
    } catch (err) {
      console.error("Step 4 failed:", err);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist typo-heading1 font-bold mb-8">
        {t(
          "Let us know your standard service rates. It will help HOA’s to offer you job",
        )}
      </h1>

      <div className="flex flex-wrap gap-y-4 gap-x-6">
        {rates.map((rateObj, idx) => (
          <div
            key={rateObj.serviceId}
            className="bg-(--white) border-2 border-(--light-grey) rounded-[10px] px-4 py-3 overflow-hidden max-w-[312px] w-full typo-body leading-[100%] text-(--black)"
          >
            <p className="text-(--grey-text) typo-small font-jakarta font-regular mb-0.5">
              {t(`How much do you charge for ${rateObj.serviceName}?`)}
            </p>

            <div className="flex items-center gap-2">
              <Currency />
              <input
                type="number"
                className="w-full bg-transparent border-none outline-none text-(--black) typo-body font-jakarta font-medium input"
                value={rateObj.rate}
                onChange={(e) =>
                  handleRateChange(rateObj.serviceName, e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-red-500 mt-2">{t("Failed to submit Rates")}</p>
      )}
    </div>
  );
});

export default FourthStep;
