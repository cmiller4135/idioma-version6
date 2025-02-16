import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [teachersOpen, setTeachersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleToolsMenu = () => {
    setToolsOpen(!toolsOpen);
    setTeachersOpen(false);
    setProfileOpen(false);
  };

  const toggleTeachersMenu = () => {
    setTeachersOpen(!teachersOpen);
    setToolsOpen(false);
    setProfileOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileOpen(!profileOpen);
    setToolsOpen(false);
    setTeachersOpen(false);
  };

  const handleSubMenuClick = () => {
    setToolsOpen(false);
    setTeachersOpen(false);
    setProfileOpen(false);
    setIsOpen(false); // Close mobile menu
  };

  return (
    <nav className="bg-custom-blue shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link to="/home" className="text-2xl font-bold text-custom-yellow">
            Idioma-AI
          </Link>

          {/* Middle: Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
          <Link to="/tools/sub2" className="text-custom-yellow">My Vocabulary</Link>
            <div className="relative">
            
              <button onClick={toggleToolsMenu} className="text-custom-yellow flex items-center">
                Language Learning Tools <ChevronDown className="ml-1 h-4 w-4 text-custom-yellow" />
              </button>
              {toolsOpen && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg">
                  <Link to="/tools/sub1" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleSubMenuClick}>Spanish Conjugations</Link>
                  {/* <Link to="/tools/sub2" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleSubMenuClick}>Spanish Vocabulary</Link> */}
                  <Link to="/tools/sub3" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleSubMenuClick}>Study a topic or industry</Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={toggleTeachersMenu} className="text-custom-yellow flex items-center">
                Multimedia Language Learning <ChevronDown className="ml-1 h-4 w-4 text-custom-yellow" />
              </button>
              {teachersOpen && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg">
                  <Link to="/teach/sub1" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleSubMenuClick}>Photo Translation</Link>
                  <Link to="/teach/sub2" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleSubMenuClick}>Audio Translation</Link>
                </div>
              )}
            </div>
            <Link to="/saas2" className="text-custom-yellow">Study a Language with AI</Link>
            {/* <Link to="/twilio" className="text-custom-yellow">Twilio</Link>
            <Link to="/twilioOptIn" className="text-custom-yellow">Twilio Messaging Opt-In</Link> */}
          </div>

          {/* Right: Profile */}
          <div className="hidden md:block">
            <div className="relative">
              <button onClick={toggleProfileMenu} className="text-custom-yellow flex items-center">
                Profile <ChevronDown className="ml-1 h-4 w-4 text-custom-yellow" />
              </button>
              {profileOpen && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg">
                  <Link to="/profile/config" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleSubMenuClick}>
                    Profile and Configuration
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); handleSubMenuClick(); }} 
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-custom-yellow"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <Link to="/tools/sub2" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>Vocabulary</Link>
            <Link to="/tools" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>Learning Tools</Link>
            <Link to="/tools/sub1" className="block py-2 pl-4 text-custom-yellow" onClick={handleSubMenuClick}>Spanish Conjugations</Link>
            <Link to="/tools/sub2" className="block py-2 pl-4 text-custom-yellow" onClick={handleSubMenuClick}>Spanish Vocabulary</Link>
            <Link to="/tools/sub3" className="block py-2 pl-4 text-custom-yellow" onClick={handleSubMenuClick}>Study a topic or industry</Link>
            
            <Link to="/teach" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>For Teachers</Link>
            <Link to="/teach/sub1" className="block py-2 pl-4 text-custom-yellow" onClick={handleSubMenuClick}>Photo Translation</Link>
            <Link to="/teach/sub2" className="block py-2 pl-4 text-custom-yellow" onClick={handleSubMenuClick}>Video Learning</Link>
            
            
            <Link to="/saas2" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>Study a Language with AI</Link>
            {/* <Link to="/twilio" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>Twilio</Link>
            <Link to="/twilioOptIn" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>Twilio Messaging Opt-In</Link> */}
            <Link to="/profile/config" className="block py-2 text-custom-yellow" onClick={handleSubMenuClick}>Profile and Configuration</Link>
            <button onClick={() => { handleLogout(); handleSubMenuClick(); }} className="w-full text-left py-2 text-custom-yellow">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  ); 
};

export default Navbar;