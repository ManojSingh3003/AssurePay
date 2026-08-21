import { UiverseLoader } from "@repo/ui";

export default function Loading() {
  return (
      <div className="w-full h-[60vh] flex items-center justify-center">
          <UiverseLoader message="LOADING" />
      </div>
  );
}