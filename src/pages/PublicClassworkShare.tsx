import { PublicContentShare } from './shared/PublicContentShare';

/**
 * Public Classwork Share Page
 * 
 * This is a thin wrapper around the unified PublicContentShare component.
 * It simply passes the content type as 'classwork'.
 */
const PublicClassworkShare = () => {
  return <PublicContentShare contentType="classwork" />;
};

export default PublicClassworkShare;
