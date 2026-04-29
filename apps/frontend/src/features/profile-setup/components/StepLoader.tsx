import React from 'react';

const StepLoader = () => {
  return (
    <div className="py-2 sm:py-2.5 bg-(--white) w-full flex flex-col justify-between mt-8 sm:mt-12.5 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[1300px] flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default StepLoader;