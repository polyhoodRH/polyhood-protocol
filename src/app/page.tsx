import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Board } from "@/components/Board";

export default function Home() {
  return (
    <>
      <Hero />
      {/* Board membaca ?c= lewat useSearchParams, dan pada rute statis Next
       *  meminta batas Suspense di sekelilingnya. */}
      <Suspense fallback={<div className="mt-6 h-96" />}>
        <Board />
      </Suspense>
    </>
  );
}
