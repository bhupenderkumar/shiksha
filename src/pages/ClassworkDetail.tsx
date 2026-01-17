import { ContentDetailsPage } from './shared/ContentDetails';

/**
 * Classwork Detail Page
 * 
 * This is a thin wrapper around the unified ContentDetailsPage component.
 * It simply passes the content type as 'classwork'.
 */
const ClassworkDetail = () => {
  return <ContentDetailsPage contentType="classwork" />;
};

export default ClassworkDetail;
