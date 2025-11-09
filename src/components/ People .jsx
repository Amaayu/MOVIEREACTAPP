import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import { 
  FaStar, FaUsers, FaChevronDown, FaSearch,
  FaArrowUp, FaArrowDown, FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const People = () => {
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Fetch popular people
  const getPeople = async () => {
    try {
      setIsLoading(true);
      let endpoint = searchQuery 
        ? `/search/person?query=${searchQuery}`
        : `/person/popular`;
      
      const { data } = await axios.get(endpoint);
      setPeople(data.results.filter(person => person.profile_path));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching people:', error);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    getPeople();
  }, [sortBy, searchQuery]);
  
  // Sort people based on selection
  const sortedPeople = [...people].sort((a, b) => {
    if (sortBy === 'popularity.desc') return b.popularity - a.popularity;
    if (sortBy === 'popularity.asc') return a.popularity - b.popularity;
    return 0;
  });
  
  // Handle person click
  const handlePersonClick = (personId) => {
    navigate(`/person/${personId}`);
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar />
      <div className="w-full flex-1 flex flex-col">
        <Topnav />
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-[#6556CD] p-3 rounded-xl">
            <FaUsers className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Actors & Celebrities</h1>
            <p className="text-zinc-400 text-sm">Discover your favorite stars</p>
          </div>
        </div>
        
        {/* Search and filter container */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Search input */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-zinc-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1830] text-white px-4 pl-10 py-3 rounded-xl border border-[#6556CD]/30 outline-none shadow-lg hover:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              placeholder="Search actors..."
            />
          </div>
          
          {/* Sort dropdown */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-zinc-300 text-sm mb-1 flex items-center gap-2">
              <FaFilter className="text-purple-500" /> Sort by
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48 bg-[#1e1830] text-white px-4 py-3 rounded-xl border border-[#6556CD]/30 outline-none shadow-lg hover:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-300 cursor-pointer appearance-none"
              >
                <option value="popularity.desc">Popularity (High to Low)</option>
                <option value="popularity.asc">Popularity (Low to High)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <FaChevronDown className="text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 mb-8 border border-[#6556CD]/20 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-purple-400 font-bold text-xl">{people.length}</div>
          <div className="text-zinc-400 text-sm">People Found</div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full">
            Actors: {people.filter(p => p.known_for_department === 'Acting').length}
          </span>
          <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full">
            Directors: {people.filter(p => p.known_for_department === 'Directing').length}
          </span>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      )}
      
      {/* People grid */}
      {!isLoading && sortedPeople.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {sortedPeople.map((person) => (
            <div
              key={person.id}
              className="group relative bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#6556CD]/20 hover:border-purple-500/30"
              onClick={() => handlePersonClick(person.id)}
            >
              {/* Person photo */}
              <div className="relative overflow-hidden aspect-square">
                {person.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-[#6556CD]/30 flex items-center justify-center">
                    <div className="text-purple-500 text-5xl">👤</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1125] to-transparent"></div>
                
                {/* Popularity badge */}
                <div className="absolute top-3 right-3 bg-[#1a1125]/80 backdrop-blur-sm text-purple-400 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <FaStar className="text-xs" />
                  <span>{person.popularity.toFixed(0)}</span>
                </div>
              </div>
              
              {/* Person name and department */}
              <div className="p-4 text-center">
                <h2 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                  {person.name}
                </h2>
                {person.known_for_department && (
                  <p className="text-sm text-zinc-400 mt-1 truncate">
                    {person.known_for_department}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && sortedPeople.length === 0 && (
        <div className="text-center py-16">
          <div className="text-purple-500 text-5xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-white mb-2">No People Found</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            {searchQuery 
              ? `No results found for "${searchQuery}"` 
              : 'Try again later or search for different people'}
          </p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default People;