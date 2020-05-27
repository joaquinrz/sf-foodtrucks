import React, { memo, useMemo, useState, useEffect } from 'react';
import {
    AzureMap,
    AzureMapDataSourceProvider,
    AzureMapFeature,
    AzureMapLayerProvider,
    AzureMapsProvider,
    IAzureDataSourceChildren,
    IAzureMapOptions,
    AzureMapPopup,
    IAzureMapControls,
} from 'react-azure-maps';
import { AuthenticationType, data, MapMouseEvent, PopupOptions, ControlOptions } from 'azure-maps-control';
import { getFoodTruckData } from '../../api/FoodTruckData';
import { FTMarker } from '../../interfaces/ftmarker.interface';

/*
 * Function that returns a Food Truck Marker with metadata to be Rendered
 */
const renderMarker = (marker: FTMarker) => {
    const rendId = Math.random();
    return (
        <AzureMapFeature
            key={rendId}
            id={rendId.toString()}
            type="Point"
            coordinate={marker.coordinates}
            properties={{
                name: marker.name,
                address: marker.address,
            }}
        />
    );
};

/*
 * The Azure Maps Component to be Rendered
 */
const SFMap: React.FC = () => {
    const initMarkers: Array<FTMarker> = [];
    const [markers, setMarkers] = useState(initMarkers);
    const [popupOptions, setPopupOptions] = useState<PopupOptions>({});
    const [popupProperties, setPopupProperties] = useState({ name: '', address: '' });

    //Calls the SF FoodTruck API
    useEffect(() => {
        getFoodTruckData().then((response) => {
            let apiMarkers: Array<FTMarker> = [];
            response.forEach((point: any) => {
                const newPoint = new data.Position(point.longitude, point.latitude);
                let currentMarker: FTMarker = {
                    name: point.applicant,
                    address: point.address,
                    coordinates: newPoint,
                };
                apiMarkers.push(currentMarker);
            });

            setMarkers(apiMarkers);
        });
    }, []);

    //Provides the initial state for the Map
    const option: IAzureMapOptions = useMemo(() => {
        return {
            authOptions: {
                authType: AuthenticationType.subscriptionKey,
                subscriptionKey: process.env.REACT_APP_AZURE_MAP_API_KEY,
            },
            center: [-122.431297, 37.773972], //San Francisco Coordinates
            zoom: 13,
            view: 'Auto',
        };
    }, []);

    //Enables The Map Control options such as Zoom
    const controls: [IAzureMapControls] = [
        {
            controlName: 'ZoomControl',
            options: { position: 'top-right' } as ControlOptions,
        },
    ];

    //Set all the Markers to be rendered
    const memoizedMarkerRender: IAzureDataSourceChildren = useMemo(
        (): any => markers.map((marker) => renderMarker(marker)),
        [markers],
    );

    return (
        <div style={styles.map}>
            <AzureMapsProvider>
                <AzureMap controls={controls} options={option}>
                    <AzureMapDataSourceProvider id={'MultiplePoint AzureMapDataSourceProvider'}>
                        <AzureMapLayerProvider
                            id={'MultiplePoint AzureMapLayerProvider'}
                            options={{
                                iconOptions: {
                                    image: 'pin-red',
                                },
                            }}
                            events={{
                                mousemove: (e: MapMouseEvent) => {
                                    if (e.shapes && e.shapes.length > 0) {
                                        const prop: any = e.shapes[0];
                                        setPopupOptions({
                                            ...popupOptions,
                                            position: new data.Position(
                                                prop.data.geometry.coordinates[0],
                                                prop.data.geometry.coordinates[1],
                                            ),
                                            pixelOffset: [0, -18],
                                        });
                                        if (prop.data.properties)
                                            setPopupProperties({
                                                ...prop.data.properties,
                                            });
                                    }
                                },
                            }}
                            type="SymbolLayer"
                        ></AzureMapLayerProvider>
                        {memoizedMarkerRender}
                    </AzureMapDataSourceProvider>
                    <AzureMapPopup
                        isVisible={true}
                        options={popupOptions}
                        popupContent={
                            <div style={styles.popup}>
                                <strong>{popupProperties.name}</strong>
                                <br />
                                {popupProperties.address}
                            </div>
                        }
                    />
                </AzureMap>
            </AzureMapsProvider>
        </div>
    );
};

const styles = {
    map: {
        height: '91vh',
    },
    popup: {
        padding: '15px',
        borderRadius: '5px',
        borderWidth: 1,
        borderColor: '#2c2c2c',
        arrowPosition: 30,
        backgroundClassName: 'transparent',
        arrowStyle: 2,
    },
};

export default memo(SFMap);
