import { data } from 'azure-maps-control';

/**
 * @desc An interface for storing the metadata for reach food truck.
 */
export declare interface FTMarker {
    coordinates: data.Position;
    name: string;
    address: string;
}
