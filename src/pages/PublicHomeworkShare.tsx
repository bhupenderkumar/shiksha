import { PublicContentShare } from './shared/PublicContentShare';

/**
 * Public Homework Share Page
 * 
 * This is a thin wrapper around the unified PublicContentShare component.
 * It simply passes the content type as 'homework'.
 */
const PublicHomeworkShare = () => {
  return <PublicContentShare contentType="homework" />;
};

export default PublicHomeworkShare;
