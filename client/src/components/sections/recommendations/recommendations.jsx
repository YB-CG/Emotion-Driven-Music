import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchRecommendations } from '../../../store/actions/recommendationActions';
// import './recommendations.css';

import Playlist from '../../songsTable/playlistTable/playlistTable';
import Header from '../../header/songsHeader';
import Spinner from '../../spinner/spinner';
import spotifyAxios from '../../../axios/spotify';

const Recommendations = ({ recommendations, fetchRecommendations, loading, error }) => {
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const playTracks = (context, offset) => {
    const songs = recommendations.slice(offset).map(track => track.uri);
    spotifyAxios.put('/me/player/play', { uris: songs });
  };
  return (
    <Spinner section loading={loading}>
      <div className="recommendations-section">
        <div className="header">
          <Header
            title="Emotion-based Recommendations"
            playSong={() => playTracks(recommendations, 0)}
            pauseSong={() => {}}
            playing={false}
          />
          {error && <div>Error: {error.message}</div>}
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
    </Spinner>
  );
};

const mapStateToProps = state => ({
  recommendations: state.recommendationReducer.recommendations,
  loading: state.recommendationReducer.fetchRecommendationsPending,
  error: state.recommendationReducer.fetchRecommendationsError
});

const mapDispatchToProps = dispatch => bindActionCreators({ fetchRecommendations }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Recommendations);
