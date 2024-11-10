import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchRecommendations } from '../../../store/actions/recommendationActions';
import { emotionData } from './emotionUtils';
import { Camera } from 'lucide-react';
import './recommendations.css';

import Playlist from '../../songsTable/playlistTable/playlistTable';
import Header from '../../header/songsHeader';
import Spinner from '../../spinner/spinner';
import spotifyAxios from '../../../axios/spotify';

const EmotionDisplay = ({ emotion }) => {
  if (!emotion || !emotionData[emotion.toLowerCase()]) return null;

  const { emoji, description } = emotionData[emotion.toLowerCase()];
  const emotionClass = `emotion-card--${emotion.toLowerCase()}`;

  return (
    <div className={`emotion-card ${emotionClass}`}>
      <span className="emotion-card__emoji">{emoji}</span>
      <h2 className="emotion-card__title">
        {emotion} Vibes
      </h2>
      <p className="emotion-card__description">
        {description}
      </p>
    </div>
  );
};

const NoDetectionMessage = ({ onRetry }) => (
  <div className="no-detection">
    <div className="no-detection__icon">
      <Camera size={48} />
    </div>
    <h2 className="no-detection__title">
      We Couldn't Detect Your Emotion
    </h2>
    <ul className="no-detection__tips">
      <li>Make sure your face is clearly visible</li>
      <li>Check that you have good lighting</li>
      <li>Position yourself at a comfortable distance from the camera</li>
      <li>Ensure your camera permissions are enabled</li>
    </ul>
    <button
      onClick={onRetry}
      className="action-button mt-6"
    >
      Try Again
      <span className="action-button__icon">🔄</span>
    </button>
  </div>
);

const LoadingMessage = () => (
  <div className="loading-state">
    <div className="loading-state__icon">📸</div>
    <div className="loading-state__text">
      <p>Capturing Your Mood...</p>
      <p className="text-sm mt-2">Stay still for a moment</p>
    </div>
  </div>
);

const Recommendations = ({ 
  recommendations, 
  fetchRecommendations, 
  loading, 
  error,
  currentEmotion 
}) => {
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const playTracks = (context, offset) => {
    if (!recommendations || recommendations.length === 0) return;
    const songs = recommendations.slice(offset).map(track => track.uri);
    spotifyAxios.put('/me/player/play', { uris: songs });
  };

  return (
    <Spinner section loading={loading}>
      <div className="recommendations-section">
        <div className="recommendations-section__header">
          <h1 className="recommendations-section__header-title">
            Mood Music Match
          </h1>
          <p className="recommendations-section__header-subtitle">
            Where Your Emotions Create the Perfect Soundtrack
          </p>
        </div>

        {loading ? (
          <LoadingMessage />
        ) : (
          <>
            {error ? (
              <div className="error-message">
                <button 
                  onClick={fetchRecommendations}
                  className="action-button mt-4"
                >
                  Try Again
                </button>
              </div>
            ) : currentEmotion ? (
              <>
                <EmotionDisplay emotion={currentEmotion} />
                
                {recommendations && recommendations.length > 0 ? (
                  <div className="playlist-section">
                    <div className="playlist-section__header">
                      <Header
                        title="Your Emotion-Powered Playlist"
                        playSong={() => playTracks(recommendations, 0)}
                        pauseSong={() => {}}
                        playing={false}
                      />
                    </div>

                    <div className="text-center py-6">
                      <button
                        onClick={fetchRecommendations}
                        className="action-button"
                      >
                        Refresh Your Mood
                        <span className="action-button__icon">💫</span>
                      </button>
                    </div>
                    <div className="playlist-section__content">
                      <Playlist
                        songs={recommendations}
                        playSong={playTracks}
                        pauseSong={() => {}}
                        current={null}
                        playing={false}
                        more={false}
                        fetchMoreSongs={() => {}}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="no-recommendations">
                    <p>No recommendations available at the moment.</p>
                  </div>
                )}
              </>
            ) : (
              <NoDetectionMessage onRetry={fetchRecommendations} />
            )}

          </>
        )}
      </div>
    </Spinner>
  );
};

const mapStateToProps = state => ({
  recommendations: state.recommendationReducer.recommendations,
  loading: state.recommendationReducer.fetchRecommendationsPending,
  error: state.recommendationReducer.fetchRecommendationsError,
  currentEmotion: state.recommendationReducer.currentEmotion
});

const mapDispatchToProps = dispatch => bindActionCreators({ fetchRecommendations }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Recommendations);