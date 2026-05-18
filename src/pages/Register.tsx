import { useEffect } from "react";
import Index from "./Index";

/**
 * /register — renders the homepage and auto-opens the global ticketing
 * modal (CC / Crypto choice). The modal itself is mounted once in
 * App.tsx and listens for the `nftnyc:open-ticketing` CustomEvent, so
 * all we have to do here is fire that event on mount.
 *
 * We dispatch on the next tick so the modal's event listener is fully
 * wired before we fire — TicketingModal mounts at the app root, but we
 * defer to be safe in case of any future ordering changes.
 */
export default function Register() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("nftnyc:open-ticketing"));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return <Index />;
}
