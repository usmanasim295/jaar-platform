import React from 'react';

type Props = {
  StepComponent: any;
  stepRef: any;
  stepProps: any;
};

const StepRenderer = ({ StepComponent, stepRef, stepProps }: Props) => {
  return (
    <StepComponent
      ref={stepRef}
      {...stepProps}
    />
  );
};

export default StepRenderer;