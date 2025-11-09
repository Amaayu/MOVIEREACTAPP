import axios  from 'axios'
import React from 'react'

const instance = axios.create({
    baseURL : "https://api.themoviedb.org/3",
    headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjA1Mzk2NWExZjYyZjdiNmU5M2NiYzk0YmNlMzFjOCIsIm5iZiI6MTc1MDc1NDUwNS4yMDcsInN1YiI6IjY4NWE2NGM5OGIzYmNkNDQ2NWE1YTVmNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kwk9CrDKddel9goxSdRogaqHrfyk9AVTjdVHt9bOk0M'
  }
})

export default instance;