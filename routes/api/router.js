let router = require("express").Router();

// HELPERS
const { authRequired } = require('../../helpers/verifyAccessToken')
const { checkPurchaseExpiry } = require('../../helpers/checkPurchaseExpiry')

// CONTROLLERS
const { login, logout } = require('../../controllers/AuthController')
const { userAgreement, deviceId, modelType, advertisements, getTimeRemaining } = require('../../controllers/MiscellaneousController')
const { getQuestions, saveAnswers } = require('../../controllers/FeedbackController')
const { getAllMovies, getMovie, getMovieGenres, getMoviesWithGenre } = require('../../controllers/MoviesController')
const { getAllEbooks, getEbook, getEbookGenres, getEbooksWithGenre } = require('../../controllers/EbooksController')
const { getAllAudiobooks, getAudiobook, getAudiobookGenres, getAudiobooksWithGenre } = require('../../controllers/AudiobooksController')
const { getTravelGuide, getAllCountryTravelGuides, getAllTravelGuidesByCountry } = require('../../controllers/TravelGuidesController')
const { getAllMusicPlaylists, getMusicsByFolder } = require('../../controllers/MusicsController');
const { getAllSeries, getSeriesGenres, getSeriesWithGenre, getSeries, getAllSeasonBySeries, getAllEpisodesBySeason, getEpisodeDetails } = require('../../controllers/SeriesController');
const { search } = require('../../controllers/SearchController');

// AUTH
router.post('/login', login)
router.post('/logout', logout)

// MISC
router.get('/user-agreement', userAgreement)
router.get('/device-id', authRequired, checkPurchaseExpiry, deviceId)
router.get('/model-type', modelType)
router.get('/advertisements', advertisements)
router.get('/time-remaining', authRequired, checkPurchaseExpiry, getTimeRemaining)

// MOVIES  TODO -- PAGINATION
router.get('/movies', authRequired, checkPurchaseExpiry, getAllMovies)
router.get('/movies/details', authRequired, checkPurchaseExpiry, getMovie)
router.get('/movies/genres', authRequired, checkPurchaseExpiry, getMovieGenres)
router.get('/movies/genres/:genre', authRequired, checkPurchaseExpiry, getMoviesWithGenre)

// SERIES  TODO -- PAGINATION
router.get('/series', authRequired, checkPurchaseExpiry, getAllSeries)
router.get('/series/details', authRequired, checkPurchaseExpiry, getSeries)
router.get('/series/genres', authRequired, checkPurchaseExpiry, getSeriesGenres)
router.get('/series/genres/:genre', authRequired, checkPurchaseExpiry, getSeriesWithGenre)
router.get('/series/seasons', authRequired, checkPurchaseExpiry,  getAllSeasonBySeries)
router.get('/series/episodes', authRequired, checkPurchaseExpiry,  getAllEpisodesBySeason)
router.get('/episode', authRequired, checkPurchaseExpiry,  getEpisodeDetails)

// EBOOKS   TODO -- PAGINATION
router.get('/ebooks', authRequired, checkPurchaseExpiry, getAllEbooks)
router.get('/ebooks/details', authRequired, checkPurchaseExpiry, getEbook)
router.get('/ebooks/genres', authRequired, checkPurchaseExpiry, getEbookGenres)
router.get('/ebooks/genres/:genre', authRequired, checkPurchaseExpiry, getEbooksWithGenre)

// AUDIO BOOKS   TODO -- PAGINATION
router.get('/audiobooks', authRequired, checkPurchaseExpiry, getAllAudiobooks)
router.get('/audiobooks/details', authRequired, checkPurchaseExpiry, getAudiobook)
router.get('/audiobooks/genres', authRequired, checkPurchaseExpiry, getAudiobookGenres)
router.get('/audiobooks/genres/:genre', authRequired, checkPurchaseExpiry, getAudiobooksWithGenre)

// TRAVEL GUIDES  TODO -- PAGINATION
router.get('/travel-guides', authRequired, checkPurchaseExpiry,  getAllTravelGuidesByCountry)
router.get('/travel-guides/details', authRequired, checkPurchaseExpiry, getTravelGuide)
router.get('/travel-guides/countries', authRequired, checkPurchaseExpiry,  getAllCountryTravelGuides)

// MUSIC
router.get('/playlists', authRequired, checkPurchaseExpiry, getAllMusicPlaylists)
router.get('/playlists/music', authRequired, checkPurchaseExpiry, getMusicsByFolder)

// NEWS  TODO -- PAGINATION
// -- TODO

// FEEDBACK
router.get('/feedback', getQuestions)
router.post('/feedback', saveAnswers)

// SEARCH
// router.post('/search', authRequired, checkPurchaseExpiry, search)
router.post('/search', search)


module.exports = router