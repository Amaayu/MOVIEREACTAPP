import React from 'react'

const Horizontalcard = ({ data, selectedType, onCategoryChange }) => {
  return (
    <div className='w-full p-3 overflow-hidden'>
      <div className='mb-4 flex justify-between items-center flex-row-reverse'>
       {/* Stylish Dropdown */}
    <div className='relative'>
    < select
    value={selectedType}
    onChange={(e) => onCategoryChange(e.target.value)}
    className='bg-zinc-800 text-white px-4 py-1  rounded-lg border border-zinc-700 outline-none shadow-sm hover:border-zinc-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer border-none'
    >
    <option value="all">🌍 All</option>
    <option value="movie">🎬 Movies</option>
    <option value="tv">📺 TV Shows</option>
   </select>
    </div>

 
        {/* Title on the right */}
        <h1 className='text-2xl text-zinc-300 font-semibold'>🔥 Trending</h1>
      </div>

      <div className='flex overflow-x-auto space-x-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pb-2'>
        {data.map((d, i) => (
          <div
            key={i}
            className='min-w-[160px] bg-zinc-900 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:scale-105 duration-300 h-48 mb-1'
          >
            <img
              src={`https://image.tmdb.org/t/p/w300/${d.backdrop_path || d.poster_path || d.profile_path}`}
              alt={d.title || d.name}
              className='w-full h-[100px] object-cover rounded-t-lg'
            />
            <div className='p-2'>
              <h2 className='text-sm font-semibold text-white truncate'>
                {d.title || d.name || d.original_name}
              </h2>
              <p className='text-xs text-zinc-400 line-clamp-2'>
                {d.overview ? d.overview.slice(0, 60) + '...' : 'No description'}
              </p>
               <span className="text-zinc-400 text-sm">more</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Horizontalcard
