import Image from 'next/image';

export default function AuthImage({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="hidden lg:block sticky top-0 w-1/2 h-[100vh]">
      <div className="relative w-full h-full">
        <Image
          src={isRTL ? '/assets/rtlAuthImage.svg' : '/assets/ltrAuthImage.svg'}
          alt="image"
          fill
          className="object-cover"
        />
      </div>{' '}
    </div>
  );
}
