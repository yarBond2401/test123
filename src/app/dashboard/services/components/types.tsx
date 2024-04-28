export interface Suggestion {
  placePrediction: {
    placeId: string;
    place: string;
    text: {
      text: string;
      matches: {
        offset?: number;
        length?: number;
        endOffset?: number;
      }
    }
    types: string[];
    structuredFormat: {
      mainText: {
        text: string;
        matches: {
          offset?: number;
          length?: number;
          endOffset?: number;
        }[];
      };
      secondaryText: {
        text: string;
      };
    };
  };
}

export interface ZipToLocation {
  zip: number;
  lat: number;
  lng: number;
}