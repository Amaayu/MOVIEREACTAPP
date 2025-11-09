import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { FaTimes, FaStar, FaPlay, FaCalendarAlt, FaClock, FaGlobe } from 'react-icons/fa';

const MovieDetailModal = ({ item, onClose, onPlayClick }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';
        const { data } = await axios.get(`/${mediaType}/${item.id}`);
        setDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [item]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6556CD]"></div>
      </div>
    );
  }

  if (!details) return null;

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const runtime = details.runtime || details.episode_run_time?.[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-2xl overflow-hidden border border-[#6556CD]/30">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
          >
            <FaTimes className="text-white text-xl" />
          </button>

          {/* Backdrop image */}
          <div className="relative h-64 md:h-96">
            <img
              src={`https://image.tmdb.org/t/p/original/${details.backdrop_path || details.poster_path}`}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1830] to-transparent"></div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 -mt-20 relative z-10">
            {/* Title and rating */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
              {details.vote_average && (
                <div className="flex items-center gap-2 bg-[#6556CD] px-4 py-2 rounded-full">
                  <FaStar className="text-amber-400" />
                  <span className="text-white font-bold">{details.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-zinc-300 mb-6">
              {releaseDate && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#6556CD]" />
                  <span>{new Date(releaseDate).getFullYear()}</span>
                </div>
              )}
              {runtime && (
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#6556CD]" />
                  <span>{runtime} min</span>
                </div>
              )}
              {details.original_language && (
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-[#6556CD]" />
                  <span>{details.original_language.toUpperCase()}</span>
                </div>
              )}
              {details.number_of_seasons && (
                <div className="flex items-center gap-2">
                  <span className="text-[#6556CD]">📺</span>
                  <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {details.genres && details.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-[#6556CD]/20 text-[#9b8aff] rounded-full text-sm border border-[#6556CD]/30"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {details.overview && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Overview</h3>
                <p className="text-zinc-300 leading-relaxed">{details.overview}</p>
              </div>
            )}

            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {details.status && (
                <div>
                  <span className="text-zinc-400">Status:</span>
                  <span className="text-white ml-2">{details.status}</span>
                </div>
              )}
              {details.budget && details.budget > 0 && (
                <div>
                  <span className="text-zinc-400">Budget:</span>
                  <span className="text-white ml-2">${(details.budget / 1000000).toFixed(1)}M</span>
                </div>
              )}
              {details.revenue && details.revenue > 0 && (
                <div>
                  <span className="text-zinc-400">Revenue:</span>
                  <span className="text-white ml-2">${(details.revenue / 1000000).toFixed(1)}M</span>
                </div>
              )}
              {details.production_companies && details.production_companies.length > 0 && (
                <div>
                  <span className="text-zinc-400">Production:</span>
                  <span className="text-white ml-2">{details.production_companies[0].name}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  onPlayClick(item);
                  onClose();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                <FaPlay />
                <span>Play Trailer</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 bg-[#1e1830] hover:bg-[#2a1f40] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-[#6556CD]/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;
