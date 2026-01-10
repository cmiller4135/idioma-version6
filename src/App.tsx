import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TagManager from 'react-gtm-module';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LeftColumn from './components/LeftColumn';
import MobileNav from './components/MobileNav';
import { SkipLink, AnnouncerProvider, Spinner } from './components/ui';

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Tools = lazy(() => import('./pages/Tools'));
const Teach = lazy(() => import('./pages/Teach'));
const Saas1 = lazy(() => import('./pages/Saas1'));
const Saas2 = lazy(() => import('./pages/Saas2'));
const Sub1 = lazy(() => import('./pages/tools/Sub1'));
const Sub2 = lazy(() => import('./pages/tools/Sub2'));
const Sub3 = lazy(() => import('./pages/tools/Sub3'));
const TeachSub1 = lazy(() => import('./pages/teach/TeachSub1'));
const TeachSub2 = lazy(() => import('./pages/teach/TeachSub2'));
const ProfileConfig = lazy(() => import('./pages/ProfileConfig'));

const tagManagerArgs = {
  gtmId: 'GTM-KJTB89TKD'
};

// Loading fallback component
const PageLoader: React.FC = () => (
  <div
    className="flex items-center justify-center min-h-[400px]"
    role="status"
    aria-label="Loading page"
  >
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500">Loading...</p>
    </div>
  </div>
);

// Layout component with responsive design
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink targetId="main-content" />
      <Navbar />

      <main
        id="main-content"
        className="
          flex-1 container-custom
          py-4 sm:py-6 lg:py-8
          pb-20 lg:pb-8
        "
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        {/* Responsive Grid Layout */}
        <div className="
          grid gap-4 sm:gap-6 lg:gap-8
          grid-cols-1
          lg:grid-cols-4
        ">
          {/* Main Content - Full width on mobile, 3/4 on desktop */}
          <div className="lg:col-span-3 order-1">
            {children}
          </div>

          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <aside
            className="hidden lg:block lg:col-span-1 order-2"
            role="complementary"
            aria-label="Sidebar"
          >
            <div className="sticky top-24">
              <LeftColumn />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer - Hidden on mobile when bottom nav is showing */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);

  return (
    <AnnouncerProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Layout><Home /></Layout>} />
            <Route path="/tools" element={<Layout><Tools /></Layout>} />
            <Route path="/tools/sub1" element={<Layout><Sub1 /></Layout>} />
            <Route path="/tools/sub2" element={<Layout><Sub2 /></Layout>} />
            <Route path="/tools/sub3" element={<Layout><Sub3 /></Layout>} />
            <Route path="/teach" element={<Layout><Teach /></Layout>} />
            <Route path="/teach/sub1" element={<Layout><TeachSub1 /></Layout>} />
            <Route path="/teach/sub2" element={<Layout><TeachSub2 /></Layout>} />
            <Route path="/saas1" element={<Layout><Saas1 /></Layout>} />
            <Route path="/saas2" element={<Layout><Saas2 /></Layout>} />
            <Route path="/profile/config" element={<Layout><ProfileConfig /></Layout>} />
          </Routes>
        </Suspense>
      </Router>
    </AnnouncerProvider>
  );
}

export default App;
