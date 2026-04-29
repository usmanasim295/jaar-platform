import React from 'react';

type Props = {
  currentStep: number;
  totalSteps: number;
};

const StepProgress = ({ currentStep, totalSteps }: Props) => {
  return (
    <div className="relative w-full h-1.5 sm:h-2 bg-(--light-grey) mb-4 sm:mb-6 lg:mb-8">
      <div
        className="absolute h-1.5 sm:h-2 bg-(--primary) rounded-r-full transition-all duration-300"
        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
      />
    </div>
  );
};

export default StepProgress;
