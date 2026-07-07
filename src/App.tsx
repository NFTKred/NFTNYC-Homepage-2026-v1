import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import TSChallenge from "./pages/TSChallenge";
import Speak from "./pages/Speak";
import Speakers from "./pages/Speakers";
import Register from "./pages/Register";
import Blogs from "./pages/Blogs";
import BlogXpKred from "./pages/BlogXpKred";
import BlogTsChallenge from "./pages/BlogTsChallenge";
import BlogHistoryOfRemix from "./pages/BlogHistoryOfRemix";
import BlogCloserLook2026Speakers from "./pages/BlogCloserLook2026Speakers";
import BlogTsMomentum2026 from "./pages/BlogTsMomentum2026";
import Journey from "./pages/Journey";
import Origins from "./pages/Origins";
import NotFound from "./pages/NotFound";
import VerticalPage from "./pages/VerticalPage";
import CardPreview from "./pages/CardPreview";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import TSOptout from "./pages/TSOptout";
import Sponsor from "./pages/Sponsor";
import SponsorTSChallenge from "./pages/SponsorTSChallenge";
import Visa from "./pages/Visa";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import TicketingModal from "./components/TicketingModal";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Global ticketing modal — fired site-wide via the
          'nftnyc:open-ticketing' CustomEvent. Mounted once here so any
          'Earlybird Tickets' button anywhere on the site can open it. */}
      <TicketingModal />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ts-challenge" element={<TSChallenge />} />
          <Route path="/speak" element={<Speak />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blogs />} />
          <Route path="/blog/xp-and-kredits" element={<BlogXpKred />} />
          <Route path="/blog/ts-challenge" element={<BlogTsChallenge />} />
          <Route path="/blog/history-of-remix" element={<BlogHistoryOfRemix />} />
          <Route path="/blog/closer-look-2026-speakers" element={<BlogCloserLook2026Speakers />} />
          <Route path="/blog/ts-challenge-momentum-2026" element={<BlogTsMomentum2026 />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/origins" element={<Origins />} />
          <Route path="/ts-optout" element={<TSOptout />} />
          <Route path="/sponsor" element={<Sponsor />} />
          <Route path="/sponsor/ts-challenge" element={<SponsorTSChallenge />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/card/:resourceId" element={<CardPreview />} />
          <Route path="/:verticalId" element={<VerticalPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
