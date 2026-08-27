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
import BlogPost from "./pages/BlogPost";
import Journey from "./pages/Journey";
import Origins from "./pages/Origins";
import NotFound from "./pages/NotFound";
import VerticalPage from "./pages/VerticalPage";
import CardPreview from "./pages/CardPreview";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import BlogList from "./pages/admin/BlogList";
import BlogEditor from "./pages/admin/BlogEditor";
import TSOptout from "./pages/TSOptout";
import Sponsor from "./pages/Sponsor";
import SponsorTSChallenge from "./pages/SponsorTSChallenge";
import Visa from "./pages/Visa";
import Media from "./pages/Media";
import Volunteer from "./pages/Volunteer";
import Events from "./pages/Events";
import Program from "./pages/Program";
import VibeSprint from "./pages/VibeSprint";
import Sprint1 from "./pages/Sprint1";
import Sprint2 from "./pages/Sprint2";
import Sprint3 from "./pages/Sprint3";
import SprintFeedback from "./pages/SprintFeedback";
import ManageVolunteers from "./pages/ManageVolunteers";
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
          {/* Legacy bespoke React blog posts. Specific routes match
              before the /blog/:slug catch-all below, so these render
              their existing React pages. New posts authored through
              the Supabase-backed block system are picked up by
              /blog/:slug. When a legacy post migrates to blocks its
              route line here can be removed. */}
          <Route path="/blog/xp-and-kredits" element={<BlogXpKred />} />
          <Route path="/blog/ts-challenge" element={<BlogTsChallenge />} />
          <Route path="/blog/history-of-remix" element={<BlogHistoryOfRemix />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/origins" element={<Origins />} />
          <Route path="/ts-optout" element={<TSOptout />} />
          <Route path="/sponsor" element={<Sponsor />} />
          <Route path="/sponsor/ts-challenge" element={<SponsorTSChallenge />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/media" element={<Media />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/events" element={<Events />} />
          <Route path="/program" element={<Program />} />
          <Route path="/vibesprint" element={<VibeSprint />} />
          <Route path="/sprint1" element={<Sprint1 />} />
          <Route path="/sprint2" element={<Sprint2 />} />
          <Route path="/sprint3" element={<Sprint3 />} />
          <Route path="/sprintfeedback" element={<SprintFeedback />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
          <Route path="/admin/blog/:id/edit" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/manage/volunteers" element={<ProtectedRoute><ManageVolunteers /></ProtectedRoute>} />
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
