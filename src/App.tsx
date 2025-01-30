import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import LeftColumn from './components/LeftColumn';
import ProfileConfig from './pages/ProfileConfig';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Teach from './pages/Teach';
import Saas1 from './pages/Saas1';
import Saas2 from './pages/Saas2';
import Sub1 from './pages/tools/Sub1';
import Sub2 from './pages/tools/Sub2';
import Sub3 from './pages/tools/Sub3';
import TeachSub1 from './pages/teach/TeachSub1';
import TeachSub2 from './pages/teach/TeachSub2';
import Twilio from './pages/Twilio';
import TwilioOptIn from './pages/TwilioOptIn';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-1 container-custom py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <LeftColumn />
        </div>
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
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
        <Route path="/twilio" element={<Twilio />} />
        <Route path="/twiliooptin" element={<TwilioOptIn />} />
      </Routes>
    </Router>
  );
}

export default App;