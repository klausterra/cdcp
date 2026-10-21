import { useEffect } from "react";
import { installTracker, trackPageView } from "@/lib/analytics";

export function MatomoTracker() {
  useEffect(() => {
    installTracker();
    trackPageView();
  }, []);
  return null;
}
