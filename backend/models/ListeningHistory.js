const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  trackId: {
    type: String,
    required: true,
    index: true
  },
  trackName: {
    type: String,
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  albumName: String,
  albumImage: String,
  duration: Number,
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  playDuration: {
    type: Number, // How long the user listened (in seconds)
    default: 0
  },
  completed: {
    type: Boolean, // Did user listen to at least 80% of the track
    default: false
  },
  skipped: {
    type: Boolean, // Did user skip before 30 seconds
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
listeningHistorySchema.index({ userId: 1, playedAt: -1 });
listeningHistorySchema.index({ userId: 1, trackId: 1 });

// Static method to get user's listening stats
listeningHistorySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalPlays: { $sum: 1 },
        totalDuration: { $sum: '$playDuration' },
        completedTracks: { $sum: { $cond: ['$completed', 1, 0] } },
        skippedTracks: { $sum: { $cond: ['$skipped', 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalPlays: 0,
    totalDuration: 0,
    completedTracks: 0,
    skippedTracks: 0
  };
};

// Static method to get user's favorite artists
listeningHistorySchema.statics.getFavoriteArtists = async function(userId, limit = 10) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$artistName',
        playCount: { $sum: 1 },
        totalDuration: { $sum: '$playDuration' },
        tracks: { $addToSet: '$trackName' }
      }
    },
    { $sort: { playCount: -1 } },
    { $limit: limit },
    {
      $project: {
        artistName: '$_id',
        playCount: 1,
        totalDuration: 1,
        uniqueTracks: { $size: '$tracks' },
        _id: 0
      }
    }
  ]);
};

// Static method to get recently played tracks
listeningHistorySchema.statics.getRecentlyPlayed = async function(userId, limit = 20) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $sort: { playedAt: -1 } },
    {
      $group: {
        _id: '$trackId',
        trackName: { $first: '$trackName' },
        artistName: { $first: '$artistName' },
        albumName: { $first: '$albumName' },
        albumImage: { $first: '$albumImage' },
        duration: { $first: '$duration' },
        lastPlayed: { $first: '$playedAt' },
        playCount: { $sum: 1 }
      }
    },
    { $sort: { lastPlayed: -1 } },
    { $limit: limit },
    {
      $project: {
        id: '$_id',
        name: '$trackName',
        artist_name: '$artistName',
        album_name: '$albumName',
        album_image: '$albumImage',
        duration: 1,
        lastPlayed: 1,
        playCount: 1,
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema);
