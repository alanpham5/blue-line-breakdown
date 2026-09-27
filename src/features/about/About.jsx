import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, Info } from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { SiteInfoTab } from "features/about/components/SiteInfoTab";
import { MetricsTab } from "features/about/components/MetricsTab";

const tabs = [
  { id: "site-info", label: "Site Info", icon: Info },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
];

const DEFAULT_TAB = tabs[0].id;

const AboutTabs = ({ activeTab, onSelect }) => {
  const focusTab = (index) => {
    const nextTab = tabs[(index + tabs.length) % tabs.length];
    onSelect(nextTab.id);
    document.getElementById(`about-tab-${nextTab.id}`)?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "ArrowRight") focusTab(index + 1);
    if (event.key === "ArrowLeft") focusTab(index - 1);
  };

  return (
    <div
      role="tablist"
      aria-label="About sections"
      className="inline-flex self-start gap-1 rounded-full bg-black/20 p-1 backdrop-blur-sm light:bg-white/80 sm:self-auto"
    >
      {tabs.map(({ id, label, icon: Icon }, index) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            id={`about-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`about-panel-${id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#7ee340] sm:px-5 sm:text-base ${
              isActive
                ? "bg-white/10 text-[#7ee340] light:bg-slate-900/10 light:text-[#2e6e14]"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100 light:text-slate-600 light:hover:bg-slate-900/5 light:hover:text-slate-800"
            }`}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export const About = ({ enablePageLoadAnimations = true }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = tabs.some(({ id }) => id === requestedTab)
    ? requestedTab
    : DEFAULT_TAB;
  const animationClass = enablePageLoadAnimations ? "liquid-glass-animate" : "";

  useEffect(() => {
    document.title = "About | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  const selectTab = (tabId) => {
    if (tabId === activeTab) return;
    const nextParams = new URLSearchParams(searchParams);
    if (tabId === DEFAULT_TAB) nextParams.delete("tab");
    else nextParams.set("tab", tabId);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="max-w-6xl mx-auto relative z-10">
        <Header />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="section-title text-4xl sm:text-5xl">About</h1>
          <AboutTabs activeTab={activeTab} onSelect={selectTab} />
        </div>
        <div
          id={`about-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`about-tab-${activeTab}`}
        >
          {activeTab === "metrics" ? (
            <MetricsTab />
          ) : (
            <SiteInfoTab animationClass={animationClass} />
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};
