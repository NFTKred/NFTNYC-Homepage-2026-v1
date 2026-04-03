import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TSChallenge from "./pages/TSChallenge";
import Speak from "./pages/Speak";
import Blogs from "./pages/Blogs";
import BlogXpKred from "./pages/BlogXpKred";
import NotFound from "./pages/NotFound";
import VerticalPage from "./pages/VerticalPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ts-challenge" element={<TSChallenge />} />
          <Route path="/speak" element={<Speak />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/xp-and-kredits" element={<BlogXpKred />} />
          <Route path="/:verticalId" element={<VerticalPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
