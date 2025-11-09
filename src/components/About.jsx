import React from 'react';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import { 
  FaInfoCircle, FaFilm, FaTv, FaUsers, 
  FaStar, FaHeart, FaRocket, FaShieldAlt 
} from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaFilm className="text-3xl" />,
      title: 'Extensive Movie Library',
      description: 'Access thousands of movies from various genres and eras'
    },
    {
      icon: <FaTv className="text-3xl" />,
      title: 'TV Shows Collection',
      description: 'Discover popular TV series and binge-worthy content'
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: 'Celebrity Database',
      description: 'Explore profiles of your favorite actors and directors'
    },
    {
      icon: <FaStar className="text-3xl" />,
      title: 'Ratings & Reviews',
      description: 'See what others think with comprehensive ratings'
    },
    {
      icon: <FaHeart className="text-3xl" />,
      title: 'Personalized Lists',
      description: 'Create and manage your own watchlists'
    },
    {
      icon: <FaRocket className="text-3xl" />,
      title: 'Fast & Responsive',
      description: 'Lightning-fast performance on all devices'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Movies' },
    { number: '5K+', label: 'TV Shows' },
    { number: '50K+', label: 'Actors' },
    { number: '100K+', label: 'Users' }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar />
      <div className="w-full flex-1 flex flex-col">
        <Topnav />
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-8">
          
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] p-3 rounded-xl">
              <FaInfoCircle className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">About MovieHub</h1>
              <p className="text-zinc-400 text-sm">Your ultimate entertainment companion</p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-8 mb-8 border border-[#6556CD]/20">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to MovieHub</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              MovieHub is your one-stop destination for discovering and exploring the world of entertainment. 
              We provide comprehensive information about movies, TV shows, and the talented people who bring 
              these stories to life.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Our platform is designed to help you find your next favorite movie or show, learn about upcoming 
              releases, and stay updated with the latest trends in the entertainment industry.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 border border-[#6556CD]/20 text-center"
              >
                <div className="text-3xl font-bold text-[#6556CD] mb-2">{stat.number}</div>
                <div className="text-zinc-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 border border-[#6556CD]/20 hover:border-[#6556CD]/50 transition-all duration-300"
                >
                  <div className="text-[#6556CD] mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-8 mb-8 border border-[#6556CD]/20">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-[#6556CD] text-2xl" />
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed mb-4">
              At MovieHub, we believe that everyone deserves easy access to quality entertainment information. 
              Our mission is to create a seamless, user-friendly platform that connects movie and TV show 
              enthusiasts with the content they love.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              We're committed to providing accurate, up-to-date information and creating a community where 
              entertainment lovers can discover, share, and celebrate their favorite content.
            </p>
          </div>

          {/* Technology Section */}
          <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-8 border border-[#6556CD]/20">
            <h2 className="text-2xl font-bold text-white mb-4">Built With Modern Technology</h2>
            <p className="text-zinc-300 leading-relaxed mb-6">
              MovieHub is built using cutting-edge web technologies to ensure a fast, responsive, 
              and enjoyable user experience across all devices.
            </p>
            <div className="flex flex-wrap gap-3">
              {['React', 'Redux', 'Tailwind CSS', 'Vite', 'TMDB API', 'React Router'].map((tech, index) => (
                <span 
                  key={index}
                  className="bg-[#6556CD]/20 text-[#9b8aff] px-4 py-2 rounded-lg border border-[#6556CD]/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
