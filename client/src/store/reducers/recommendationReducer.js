const initialState = {
  recommendations: [],
  fetchRecommendationsPending: false,
  fetchRecommendationsError: null
};

const recommendationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_RECOMMENDATIONS_PENDING':
      return {
        ...state,
        fetchRecommendationsPending: true,
        fetchRecommendationsError: null
      };
    case 'FETCH_RECOMMENDATIONS_SUCCESS':
      return {
        ...state,
        recommendations: action.data,
        fetchRecommendationsPending: false
      };
    case 'FETCH_RECOMMENDATIONS_ERROR':
      return {
        ...state,
        fetchRecommendationsPending: false,
        fetchRecommendationsError: action.error
      };
    default:
      return state;
  }
};

export default recommendationReducer;
