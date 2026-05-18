import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * Catch-all 404 page.
 *
 * Important: we emit <meta name="robots" content="noindex,nofollow"> so
 * Google de-indexes any legacy URL it crawls and lands on this page. Our
 * SPA can't return a real 404 status (Vercel serves index.html for every
 * unmatched path), so noindex is the next-best signal that tells Google
 * "drop this URL."
 *
 * For known legacy URLs we additionally 301 in vercel.json so users
 * get sent somewhere useful instead of seeing this page at all.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <title>Page not found - NFT.NYC</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
