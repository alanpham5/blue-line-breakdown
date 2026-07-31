import { Search } from "lucide-react";

export const LookupHeader = ({ title, subtext = "" }) => (
  <div className="mb-5">
    <div className={`flex items-center gap-2 ${subtext ? "mb-1" : ""}`}>
      <Search
        className="h-6 w-6 shrink-0 text-[#7ee340] light:text-[#2e6e14]"
        aria-hidden="true"
      />
      <h2 className="text-2xl font-bold tracking-display text-white light:text-gray-900 sm:text-3xl">
        {title}
      </h2>
    </div>
    {subtext && (
      <p className="text-sm text-gray-400 light:text-gray-600">{subtext}</p>
    )}
  </div>
);
