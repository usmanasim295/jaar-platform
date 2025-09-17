"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { StepProps } from "../types";
import { Plus2Icon } from "../../../components/assets/icons";
import FileUpload from "@/components/modals/FileUpload";
import { useUpdateProfileStepMutation } from "@/store/api";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { toast } from "react-toastify";
import type { Language } from "@/types/api";
import InputField from "@/components/ui/InputField";
import { useForm } from "react-hook-form";
import Image from "next/image";

type BankDetailsForm = {
  firstName: string;
  lastName: string;
  accountNumber: string;
};

const SevenStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = (file: File) => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(t("File too large. Please choose a file smaller than 5MB."));
      return;
    }
    
    // Check file type (PDF, DOC, DOCX)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("Please select a PDF or Word document."));
      return;
    }
    
    setSelectedFile(file);
  };

  const [updateProfileStep] = useUpdateProfileStepMutation();
  const { control, getValues, trigger } = useForm<BankDetailsForm>({
    defaultValues: {
      firstName: data?.seventh?.firstName || "",
      lastName: data?.seventh?.lastName || "",
      accountNumber: data?.seventh?.accountNumber || "",
    },
  });

  useEffect(() => {
    const prev = data?.seventh || {};
    const values = getValues();
    if (
      prev.firstName !== values.firstName ||
      prev.lastName !== values.lastName ||
      prev.accountNumber !== values.accountNumber ||
      prev.document !== selectedFile?.name
    ) {
      setData("seventh", {
        ...values,
        document: selectedFile?.name || prev.document || null,
      });
    }
  }, [selectedFile]);

  const handleSubmitStep7 = async () => {
    const isValid = await trigger(["firstName", "lastName", "accountNumber"]);
    if (!isValid) {
      console.error("Form validation failed!");
      return false;
    }

    const id = localStorage.getItem("serviceProviderId");
    if (!id) {
      console.error("Service provider ID is missing!");
      return false;
    }

    const values = getValues();
    const formData = new FormData();
    formData.append("serviceProviderId", id);
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("bankAccountNumber", values.accountNumber);

    if (selectedFile) {
      formData.append("bankDocument", selectedFile);
    }

    try {
      const res = await updateProfileStep({ step: 6, data: formData, lang: i18n.language as Language }).unwrap();

      setData("seventh", {
        ...values,
        document: selectedFile?.name || null,
      });

      console.log("Step 7 success:", res);
      toast.success(t("Bank details updated successfully!"));
      return true;
    } catch (err: any) {
      console.error("Step 7 failed:", err);
      const errorMessage = err?.data?.message || err?.message || t("Failed to update bank details. Please try again.");
      toast.error(errorMessage);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep7,
  }));

  return (
    <div className="">
      <h1 className="font-urbanist typo-heading1 font-bold mb-8 max-w-[712px] w-full">
        {t(
          "Add your card details to ensure you get paid quickly and securely.",
        )}
      </h1>

      <div className="w-full shadow-dark p-4 rounded-xl max-w-[536px]">
        <h3 className="typo-label font-bold mb-4 font-urbanist">
          {t("Add Bank details")}
        </h3>

        <div className="flex gap-4 mb-4">
          <InputField
            name="firstName"
            control={control}
            type="text"
            className="w-full"
            placeholder={t("First Name")}
            inputClassName="h-[60px]"
            rules={{ required: "First name is required" }}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^A-Za-z\s]/g,
                "",
              );
            }}
            placeholderAnimate={true}
          />
          <InputField
            name="lastName"
            control={control}
            type="text"
            className="w-full"
            placeholder={t("Last Name")}
            inputClassName="h-[60px]"
            rules={{ required: "Last name is required" }}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^A-Za-z\s]/g,
                "",
              );
            }}
            placeholderAnimate={true}
          />
        </div>

        <InputField
          name="accountNumber"
          control={control}
          type="text"
          className="w-full"
          placeholder={t("Bank Account Number")}
          inputClassName="h-[60px] input"
          rules={{ required: "Bank account number is required" }}
          placeholderAnimate={true}
        />

        <FileUpload
          label=""
          accept=".pdf,.doc,.docx"
          required
          onFileSelect={handleFileSelect}
          className="cursor-pointer [appearance:none]"
        >
          <div className="flex items-center justify-between gap-4 p-4 overflow-hidden mt-4 cursor-pointer">
            <div className="flex items-center gap-4">
              <Image
                src={"/assets/icons/FileGrey.svg"}
                width={24}
                height={24}
                alt="file"
              />
              <p className="text-(--black) typo-body font-jakarta">
                {selectedFile
                  ? selectedFile.name.slice(0, 20)
                  : t("Upload Document")}
              </p>
            </div>
            <Plus2Icon />
          </div>
        </FileUpload>
      </div>
    </div>
  );
});

export default SevenStep;
