import React, { useRef, useCallback } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import {CommandInput} from "@/components/ui/command";

const libraries = ["places"];

interface AutoCompleteInputProps {
    placeholder: string;
    onPlaceSelected: any;
}

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({ placeholder, onPlaceSelected }) => {
    const ref = useRef(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: 'AIzaSyAul_Yd7Vqd35uBuWMrUz-f1cF52b2WSJ8',
        // @ts-ignore
        libraries,
    });

    const handleLoad = useCallback((autocomplete) => {
        console.log("Autocomplete is loaded");
    }, []);

    const handleChange = useCallback(() => {
        console.log('place', ref.current);
        if (ref.current && onPlaceSelected) {
            const place = ref.current.getPlace();
            onPlaceSelected(place);
        }
    }, [onPlaceSelected]);

    return isLoaded ? (
        <Autocomplete
            onLoad={handleLoad}
            onPlaceChanged={handleChange}
        >
            <CommandInput
                ref={ref}
                placeholder={placeholder}
            />
        </Autocomplete>
    ) : null;
};

export default AutoCompleteInput;
