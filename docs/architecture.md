# Home Page Architecture

## Migration Status

The Home page has been successfully migrated from a monolithic implementation (old src/pages/Home.tsx) to a modular, component-based architecture in src/pages/Home/. The old implementation has been verified to be fully migrated and can be safely removed.

## Component Structure

The home page is organized into a modular, section-based architecture:

### 1. Main Component (src/pages/Home/index.tsx)
- Uses PageAnimation wrapper for smooth transitions
- Implements scroll-to-top behavior on load
- Composed of multiple independent section components
- Sections are rendered in a logical flow for user experience

### 2. Section Components
Located in `src/pages/Home/components/`:
- HeroSection: Main landing view
- FeaturesSection: School features/highlights
- AdmissionProcess: Admission steps/info
- VideosSection: YouTube integration (see below)
- AchievementsSection: School achievements
- QuickLinks: Important action links
- TestimonialsSection: User testimonials
- MapSection: School location map

### 3. QuickLinks Component
Located in `src/pages/Home/components/QuickLinks.tsx`:
```typescript
// Navigation links configuration
const links = [
  {
    to: "/admission-enquiry",
    label: "Admission Enquiry",
  },
  {
    to: "/year-end-feedback",
    label: "Submit Year-End Feedback",
  },
  {
    to: "/view-year-end-feedback",
    label: "View Feedback Records",
  },
];
```

Features:
- Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- Framer Motion animations for enhanced UX
- Direct integration with React Router for navigation
- Consistent button styling with hover effects
- Clear visual hierarchy with section title and description

## Implementation Notes

1. **Home Page Migration**:
   - Current implementation moved to `src/pages/Home/index.tsx`
   - Old `Home.tsx` pending cleanup after verification

2. **Component Dependencies**:
   - UI components from shared library (@/components/ui)
   - Routing via react-router-dom
   - Animation via framer-motion
   - Layout utilities via Tailwind CSS

3. **Responsive Design**:
   - Mobile-first approach
   - Breakpoint-based grid systems
   - Flexible container widths
   - Adaptive spacing and typography

4. **Performance Considerations**:
   - Component-based code splitting
   - Optimized animations
   - Efficient routing
   - Smart state management

## Best Practices

1. **Component Organization**:
   - Keep components focused and single-responsibility
   - Maintain consistent file structure
   - Use clear, descriptive component names
   - Group related components together

2. **Styling**:
   - Use Tailwind utility classes for consistency
   - Follow responsive design patterns
   - Maintain consistent spacing and layout
   - Use CSS variables for theming

3. **State Management**:
   - Keep state close to where it's needed
   - Use hooks for shared functionality
   - Implement proper loading states
   - Handle errors gracefully

4. **Accessibility**:
   - Maintain semantic HTML structure
   - Include proper ARIA attributes
   - Ensure keyboard navigation
   - Test with screen readers

## Future Improvements

1. **Performance**:
   - Implement lazy loading for sections
   - Add page load analytics
   - Optimize image loading
   - Add service worker support

2. **Features**:
   - Add more quick links based on user needs
   - Implement link analytics
   - Add role-based quick links
   - Enhanced animation effects

3. **Testing**:
   - Add component unit tests
   - Implement E2E testing
   - Add performance monitoring
   - Test across different devices

4. **Documentation**:
   - Add detailed component documentation
   - Include usage examples
   - Document styling conventions
   - Add maintenance guidelines

# YouTube Integration Architecture

## Current Implementation Issues

The YouTube video integration currently has several issues that need to be addressed:

1. **Duplicate Implementations**:
   - Video fetching logic exists in both Home.tsx and useYouTubeVideos hook
   - Home.tsx implementation works but isn't reusable
   - Hook implementation doesn't use the YouTube API

2. **Component Issues**:
   - VideosSection.tsx uses incorrect YouTube URL format
   - Only displays one video when it should show multiple
   - URL construction needs to use embed format

3. **Integration Disconnect**:
   - Home.tsx doesn't use the VideosSection component
   - useYouTubeVideos hook not properly integrated

## Current Architecture

The YouTube video integration is split across:

### 1. Environment Configuration
- `VITE_YOUTUBE_API_KEY`: For YouTube Data API v3 authentication
- `VITE_YOUTUBE_CHANNEL_ID`: For specifying which channel's videos to fetch

### 2. Home.tsx Implementation
The main YouTube integration logic resides in `Home.tsx`:
- `fetchLatestVideos()` function fetches the latest 5 videos from the specified channel
- Uses YouTube Data API v3 to fetch video data
- Handles error cases and environment variable validation
- Returns simplified video objects with just id and title

### 3. Unused Components
- `src/hooks/useYouTubeVideos.ts`: Currently not used, contains simplified logic without actual API integration
- `src/pages/Home/components/VideosSection.tsx`: May be intended for video section but not currently used

## Implementation Plan

1. **Update useYouTubeVideos Hook**:
   ```typescript
   // src/hooks/useYouTubeVideos.ts
   export function useYouTubeVideos() {
     const [videos, setVideos] = useState<Video[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);

     useEffect(() => {
       async function fetchVideos() {
         try {
           const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
           const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

           if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
             throw new Error('YouTube API key or Channel ID not configured');
           }

           const response = await fetch(
             `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`
           );

           if (!response.ok) {
             throw new Error(`YouTube API request failed: ${response.statusText}`);
           }

           const data = await response.json();
           setVideos(data.items.map((item: any) => ({
             id: { videoId: item.id.videoId },
             snippet: { title: item.snippet.title }
           })));
         } catch (error) {
           setError(error instanceof Error ? error : new Error('Failed to fetch videos'));
         } finally {
           setIsLoading(false);
         }
       }

       fetchVideos();
     }, []);

     return { videos, isLoading, error };
   }
   ```

2. **Fix VideosSection Component**:
   ```typescript
   // src/pages/Home/components/VideosSection.tsx
   export function VideosSection() {
     const { videos, isLoading, error } = useYouTubeVideos();

     if (error) {
       return (
         <section className="py-12 px-4">
           <div className="container mx-auto">
             <Alert variant="destructive">
               <p>Failed to load videos: {error.message}</p>
             </Alert>
           </div>
         </section>
       );
     }

     if (isLoading) {
       return (
         <section className="py-12 px-4">
           <div className="container mx-auto text-center">
             <Loader2 className="h-8 w-8 animate-spin mx-auto" />
             <p className="text-muted-foreground mt-2">Loading videos...</p>
           </div>
         </section>
       );
     }

     return (
       <section className="py-12 px-4">
         <div className="container mx-auto">
           <h2 className="text-3xl font-bold text-center mb-8">Latest School Activities</h2>
           <div className="flex overflow-x-auto space-x-6 pb-4">
             {videos.map((video) => (
               <motion.div
                 key={video.id.videoId}
                 whileHover={{ scale: 1.02 }}
                 className="video-item min-w-[300px] bg-white rounded-xl shadow-lg overflow-hidden"
               >
                 <iframe
                   width="100%"
                   height="200"
                   src={`https://www.youtube.com/embed/${video.id.videoId}`}
                   title={video.snippet.title}
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 ></iframe>
                 <div className="p-4">
                   <h3 className="text-lg font-semibold line-clamp-2">{video.snippet.title}</h3>
                 </div>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
     );
   }
   ```

3. **Update Home.tsx**:
   - Remove the existing video fetching logic
   - Import and use the VideosSection component
   - Remove duplicate Video type definition

4. **Environment Configuration**:
   - Both VITE_YOUTUBE_API_KEY and VITE_YOUTUBE_CHANNEL_ID must be configured
   - API key should be restricted to YouTube Data API v3
   - Channel ID should be the correct YouTube channel ID

5. **Error States to Handle**:
   - Missing environment variables
   - YouTube API request failures
   - Network connectivity issues
   - Empty video list

## Sample Usage

```typescript
// In useYouTubeVideos.ts
export function useYouTubeVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      // Implementation moved from Home.tsx
    }
    fetchVideos();
  }, []);

  return { videos, isLoading, error };
}

// In VideosSection.tsx
export function VideosSection({ videos }: { videos: Video[] }) {
  return (
    <section className="py-12 px-4">
      {/* Video display logic moved from Home.tsx */}
    </section>
  );
}

// In Home.tsx
export default function Home() {
  const { videos, isLoading, error } = useYouTubeVideos();
  
  return (
    <PageAnimation>
      {/* Other sections */}
      <VideosSection videos={videos} />
      {/* Other sections */}
    </PageAnimation>
  );
}
```

## Testing & Monitoring

1. **Unit Testing**:
   - Test useYouTubeVideos hook with mock fetch responses
   - Test VideosSection component rendering states
   - Test error handling and loading states
   - Test environment variable validation

2. **Integration Testing**:
   - Verify video fetching with real API
   - Test error scenarios with network issues
   - Test component integration in Home.tsx
   - Verify correct video playback

3. **Performance Monitoring**:
   - Track video load times
   - Monitor API quota usage
   - Track user interaction metrics
   - Monitor error rates

## Maintenance Guidelines

1. **API Key Management**:
   - Regularly rotate YouTube API keys
   - Monitor API quota usage
   - Implement proper key restrictions
   - Document key renewal process

2. **Error Handling**:
   - Log all API failures
   - Monitor error patterns
   - Update error messages as needed
   - Maintain user-friendly error states

3. **Feature Roadmap**:
   - Implement video caching
   - Add infinite scroll
   - Add video search functionality
   - Support multiple channels
   - Add video analytics