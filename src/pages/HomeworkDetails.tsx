import { ContentDetailsPage } from './shared/ContentDetails';

/**
 * Homework Details Page
 * 
 * This is a thin wrapper around the unified ContentDetailsPage component.
 * It simply passes the content type as 'homework'.
 */
const HomeworkDetails = () => {
  return <ContentDetailsPage contentType="homework" />;
};

export default HomeworkDetails;
