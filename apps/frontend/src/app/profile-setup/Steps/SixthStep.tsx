"use client";

import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import Button from "../../../components/ui/Button";
import { StepProps } from "../types";
import { PlusIcon } from "../../../components/assets/icons";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useUpdateProfileStepMutation } from "@/store/api";
import { toast } from "react-toastify";
import type { Language } from "@/types/api";

const SixthStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    data?.sixth?.imageUrl || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bio, setBio] = useState(data?.sixth?.bio || "");
  const [updateProfileStep] = useUpdateProfileStepMutation();

  useEffect(() => {
    const prev = data?.sixth || {};
    if (prev.bio !== bio || prev.imageUrl !== imagePreview) {
      setData("sixth", { bio, imageUrl: imagePreview });
    }
  }, [bio, imagePreview]);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error(t("File too large. Please choose a file smaller than 5MB."));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(t("Please select an image file."));
        return;
      }
      
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSubmitStep6 = async () => {
    const id = localStorage.getItem("serviceProviderId");
    if (!id) {
      console.error("Service provider ID is missing!");
      return false;
    }
    const formData = new FormData();
    formData.append("serviceProviderId", id);
    formData.append("bio", bio);
    if (imageFile) {
      formData.append("profilePicture", imageFile);
    }

    try {
      const res = await updateProfileStep({ step: 5, data: formData, lang: i18n.language as Language }).unwrap();
      setData("sixth", {
        bio,
        imageUrl: imagePreview,
      });
      console.log("Step 6 success:", res);
      toast.success(t("Profile updated successfully!"));
      return true;
    } catch (err: any) {
      console.error("Step 6 failed:", err);
      const errorMessage = err?.data?.message || err?.message || t("Failed to update profile. Please try again.");
      toast.error(errorMessage);
      return false;
    }
  };
  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep6,
  }));

  return (
    <div>
      <h1 className="font-urbanist text-xl sm:text-2xl lg:typo-heading1 font-bold mb-4 sm:mb-6 lg:mb-8 max-w-178 w-full leading-tight">
        {t(
          "Add a short bio and profile picture HOA's can get to know you better.",
        )}
      </h1>
      <div
        onClick={() => {
          if (!imagePreview) fileInputRef.current?.click();
        }}
        aria-label="upload-picture"
        className="group relative w-full h-[140px] sm:h-[168px] rounded-lg sm:rounded-[10px] bg-(--light-grey) flex items-center justify-center mb-4 sm:mb-6 cursor-pointer overflow-hidden max-w-[610px]"
      >
        {imagePreview ? (
          <>
            <img
              src={imagePreview}
              alt="Uploaded"
              className="h-full object-cover object-center"
            />
            <Button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 opacity-0 group-hover:opacity-100 transition cursor-pointer !h-8 sm:!h-10 !px-2 sm:!px-3 text-xs sm:text-sm"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {t("Delete")}
            </Button>
          </>
        ) : (
          <PlusIcon className="" />
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div className="border-2 border-(--light-grey) rounded-lg sm:rounded-[10px] p-3 sm:p-4 max-w-[610px] w-full">
        <textarea
          className="focus:outline-none border-0 w-full min-h-[120px] sm:min-h-[173px] resize-none text-(--primary-black) text-sm sm:text-base lg:typo-label"
          placeholder={t("Bio")}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
    </div>
  );
});

export default SixthStep;
