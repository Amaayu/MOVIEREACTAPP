import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  RiTvFill, RiFireFill, RiBarChartFill, 
  RiMovieFill, RiTv2Fill, RiTeamFill, 
  RiInformationFill, RiCustomerServiceFill,
  RiSettings3Fill, RiLogoutBoxRFill,
  RiMenuFill, RiCloseFill
} from 'react-icons/ri';

const Sidbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('new-feed');
  const { user } = useSelector((state) => state.auth);
  
  // Navigation sections
  const navSections = [
    {
      id: 'new-feed',
      title: 'New Feed',
      items: [
        { path: '/trending', label: 'Trending', icon: <RiFireFill /> },
        { path: '/popular', label: 'Popular', icon: <RiBarChartFill /> },
        { path: '/movies', label: 'Movies', icon: <RiMovieFill /> },
        { path: '/tv-shows', label: 'TV Shows', icon: <RiTv2Fill /> },
        { path: '/people', label: 'People', icon: <RiTeamFill /> }
      ]
    },
    {
      id: 'website-info',
      title: 'Website Information',
      items: [
        { path: '/about', label: 'About', icon: <RiInformationFill /> },
        { path: '/contact', label: 'Contact Us', icon: <RiCustomerServiceFill /> }
      ]
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-[#6556CD] text-white lg:hidden"
      >
        {isOpen ? <RiCloseFill className="text-xl" /> : <RiMenuFill className="text-xl" />}
      </button>

      {/* Desktop toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:block fixed top-4 z-50 p-2 bg-[#6556CD] hover:bg-[#7561e0] text-white rounded-r-lg transition-all duration-300 shadow-lg"
        style={{ left: isCollapsed ? '0' : '264px' }}
      >
        {isCollapsed ? <RiMenuFill className="text-xl" /> : <RiCloseFill className="text-xl" />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed lg:relative z-40 h-full bg-gradient-to-b from-[#1a1125] to-[#0d0917] transition-all duration-300 overflow-hidden ${
          isOpen ? 'left-0 w-[280px]' : '-left-full w-[280px] lg:left-0'
        } ${isCollapsed ? 'lg:w-0' : 'lg:w-[280px]'}`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#2d2541]">
          <Link to="/" onClick={() => setIsOpen(false)} className="block">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="bg-[#6556CD] p-2 rounded-lg">
                <RiTvFill className="text-xl text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                <span className="text-[#6556CD]">Movie</span>Hub
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 pl-1">Your Ultimate Entertainment Guide</p>
          </Link>
        </div>

        {/* Navigation */}
        <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3 px-2">
                {section.title}
              </h2>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl text-zinc-300 hover:bg-[#6556CD]/30 hover:text-white transition-all duration-200 ${
                      location.pathname === item.path 
                        ? 'bg-[#6556CD] text-white shadow-[0_10px_20px_rgba(101,86,205,0.3)]' 
                        : ''
                    }`}
                  >
                    <span className={`text-lg ${
                      location.pathname === item.path ? 'text-white' : 'text-[#6556CD]'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {/* User section */}
          <div className="mt-auto pt-6 border-t border-[#2d2541]">
            <div className="flex flex-col gap-2">
              <Link
                to="/settings"
                className="flex items-center gap-3 p-3 rounded-xl text-zinc-300 hover:bg-[#6556CD]/30 hover:text-white transition-all duration-200"
              >
                <RiSettings3Fill className="text-lg text-[#6556CD]" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                to="/logout"
                className="flex items-center gap-3 p-3 rounded-xl text-zinc-300 hover:bg-[#6556CD]/30 hover:text-white transition-all duration-200"
              >
                <RiLogoutBoxRFill className="text-lg text-[#6556CD]" />
                <span className="font-medium">Logout</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2d2541] bg-[#1a1125]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6556CD] to-[#9b8aff] flex items-center justify-center text-white text-lg font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {user?.name || 'User Name'}
              </h3>
              <p className="text-xs text-zinc-400">Premium Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6556CD;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d0917;
        }
      `}</style>
    </>
  );
};

export default Sidbar;