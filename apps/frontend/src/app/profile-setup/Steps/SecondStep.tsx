"use client";

import Image from "next/image";
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { StepProps } from "../types";
import { Plus2Icon } from "../../../components/assets/icons";
import FileUpload from "@/components/modals/FileUpload";
import { useUploadDocumentMutation } from "@/store/api";
import type { Language } from "@/types/api";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const SecondStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [uploadDocument, { error }] = useUploadDocumentMutation();

  useEffect(() => {
    if (data?.second?.document) {
      setFileName(data.second.document);
    }
  }, [data]);

  const handleSubmitStep2 = async () => {
    const id = localStorage.getItem("serviceProviderId");
    if (!id) {
      console.error("Missing serviceProviderId");
      return false;
    }
    if (!selectedFile && !fileName) {
      console.error("No file selected!");
      return false;
    }
    if (selectedFile) {
      try {
        const res = await uploadDocument({
          data: {
            serviceProviderId: id,
            document: selectedFile,
          },
          lang: 'en' as Language,
        }).unwrap();

        console.log("Step 2 upload success:", res);
        setData("second", { document: selectedFile.name });
        setFileName(selectedFile.name);
        toast.success(t("Document uploaded successfully!"));
        return true;
      } catch (err: any) {
        console.error("Step 2 upload failed:", err);
        const errorMessage = err?.data?.message || err?.message || t("Failed to upload document. Please try again.");
        toast.error(errorMessage);
        return false;
      }
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep2,
  }));

  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist typo-heading1 font-bold mb-8">
        {t("Please upload a valid government-issued document")}
      </h1>

      <FileUpload
        label=""
        accept=".pdf,.jpg,.jpeg,.png,.gif"
        required
        onFileSelect={(file) => {
          // Check file size (5MB limit)
          const maxSize = 5 * 1024 * 1024; // 5MB in bytes
          if (file.size > maxSize) {
            toast.error(t("File too large. Please choose a file smaller than 5MB."));
            return;
          }
          
          setSelectedFile(file);
          setFileName(file.name);
        }}
        className="cursor-pointer [appearance:none]"
      >
        <div className="relative flex items-center justify-between gap-4 bg-(--light-grey) rounded-2xl p-4 overflow-hidden w-[48%] cursor-pointer font-jakarta">
          <div className="flex items-center gap-4">
            <Image
              src={"/assets/icons/FileGrey.svg"}
              width={24}
              height={24}
              alt="file"
            />
            <p className="text-(--black) typo-body ">
              {t(fileName ? fileName.slice(0, 20) : "Upload Document")}
            </p>
          </div>
          <Plus2Icon />
        </div>
      </FileUpload>

      {error && (
        <p className="mt-4 text-red-500 font-medium">
          {t("Failed to upload. Please try again.")}
        </p>
      )}
    </div>
  );
});

export default SecondStep;
