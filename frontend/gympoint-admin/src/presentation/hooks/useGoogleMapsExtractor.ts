import { useState } from 'react';

interface ExtractedData {
  latitude: number;
  longitude: number;
  name?: string;
}

interface UseGoogleMapsExtractor {
  isExtracting: boolean;
  extractData: (url: string) => Promise<ExtractedData | null>;
}

export const useGoogleMapsExtractor = (): UseGoogleMapsExtractor => {
  const [isExtracting, setIsExtracting] = useState(false);

  const extractData = async (url: string): Promise<ExtractedData | null> => {
    if (!url || (!url.includes('google.com/maps') && !url.includes('maps.app.goo.gl'))) {
      return null;
    }

    setIsExtracting(true);
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      let latitude = 0;
      let longitude = 0;
      let placeName = '';

      const coordPattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match1 = url.match(coordPattern1);

      if (match1) {
        latitude = parseFloat(match1[1]);
        longitude = parseFloat(match1[2]);
      } else {
        const coordPattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match2 = url.match(coordPattern2);
        if (match2) {
          latitude = parseFloat(match2[1]);
          longitude = parseFloat(match2[2]);
        }
      }

      const placePattern = /\/place\/([^/@]+)/;
      const placeMatch = url.match(placePattern);
      if (placeMatch) {
        placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }

      if (latitude !== 0 && longitude !== 0) {
        return { latitude, longitude, name: placeName || undefined };
      }

      return null;
    } catch (error) {
      console.error('Error extracting data from Google Maps:', error);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  return { isExtracting, extractData };
};
