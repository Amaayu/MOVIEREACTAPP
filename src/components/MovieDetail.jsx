import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import VideoPlayer from './partials/VideoPlayer';
import { FaStar, FaPlay, FaHeart, FaBookmark, FaClock, FaCalendar, FaArrowLeft } from 'react-icons/fa';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);

  useEffect(() => {
    getMovieDetails();
  }, [id]);

  const getMovieDetails = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/movie/${id}?append_to_response=credits,videos,similar`);
      setMovie(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setIsLoading(false);
    }
  };

  const handlePlayClick = async () => {
    try {
      const { data } = await axios.get(`/movie/${id}/videos`);
      
      if (data.results && data.results.length > 0) {
        const youtubeVideos = data.results.filter(video => video.site === 'YouTube');
        
        if (youtubeVideos.length === 0) {
          alert('No trailer available for this movie');
          return;
        }
        
        const trailer = youtubeVideos.find(video => video.type === 'Trailer') || 
                       youtubeVideos.find(video => video.type === 'Teaser') || 
                       youtubeVideos[0];
        
        setSelectedVideo(trailer.key);
        setAllVideos(youtubeVideos);
      } else {
        alert('No trailer available for this movie');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('Unable to load trailer');
    }
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setAllVideos([]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
        <Sidbar />
        <div className="w-full lg:w-[80%] flex flex-col">
          <Topnav />
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6556CD]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
        <Sidbar />
        <div className="w-full lg:w-[80%] flex flex-col">
          <Topnav />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl text-white mb-4">Movie not found</h2>
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-[#6556CD] text-white rounded-lg hover:bg-[#7561e0]"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar />
      <div className="w-full flex-1 flex flex-col">
        <Topnav />
        
        <div className="flex-grow overflow-y-auto">
          {/* Hero Section */}
          <div 
            className="relative h-[60vh] md:h-[70vh] bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(13, 9, 23, 1) 0%, rgba(13, 9, 23, 0.7) 40%, rgba(13, 9, 23, 0.4) 70%, transparent), 
                               url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-zinc-900/80 hover:bg-[#6556CD] text-white rounded-lg transition-all"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white mb-4">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-2 bg-[#6556CD]/80 px-3 py-1 rounded-full">
                    <FaStar className="text-amber-400" />
                    <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {movie.release_date && (
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-[#6556CD]" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <FaClock className="text-[#6556CD]" />
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span key={genre.id} className="px-3 py-1 bg-zinc-800/80 text-white rounded-full text-sm">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handlePlayClick}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white rounded-lg font-medium transition-all"
                >
                  <FaPlay />
                  <span>Play Trailer</span>
                </button>
                <button className="p-3 bg-zinc-800/80 hover:bg-[#6556CD] text-white rounded-lg transition-all">
                  <FaBookmark />
                </button>
                <button className="p-3 bg-zinc-800/80 hover:bg-[#6556CD] text-white rounded-lg transition-all">
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-12">
            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
              <p className="text-zinc-300 leading-relaxed">{movie.overview}</p>
            </div>

            {/* Cast */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movie.credits.cast.slice(0, 12).map((person) => (
                    <div key={person.id} className="text-center">
                      <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 bg-zinc-800">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            👤
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{person.name}</p>
                      <p className="text-zinc-400 text-xs truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Movies */}
            {movie.similar?.results && movie.similar.results.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Similar Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movie.similar.results.slice(0, 10).map((similar) => (
                    <div
                      key={similar.id}
                      onClick={() => navigate(`/movie/${similar.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="relative rounded-lg overflow-hidden mb-2 bg-zinc-800 aspect-[2/3]">
                        {similar.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${similar.poster_path}`}
                            alt={similar.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            🎬
                          </div>
                        )}
                        {similar.vote_average > 0 && (
                          <div className="absolute top-2 right-2 bg-zinc-900/80 text-amber-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <FaStar />
                            {similar.vote_average.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate group-hover:text-[#6556CD]">
                        {similar.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer 
          videoKey={selectedVideo} 
          onClose={closeVideo}
          title={movie.title}
          allVideos={allVideos}
        />
      )}
    </div>
  );
};

export default MovieDetail;
