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

const renderPoint = (marker: FTMarker) => {
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

const SFMap: React.FC = () => {
    const initMarker: Array<FTMarker> = [];
    const [markers, setMarkers] = useState(initMarker);
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

    const option: IAzureMapOptions = useMemo(() => {
        return {
            authOptions: {
                authType: AuthenticationType.subscriptionKey,
                subscriptionKey: process.env.REACT_APP_AZURE_MAP_API_KEY,
            },
            center: [-122.431297, 37.773972],
            zoom: 13,
            view: 'Auto',
        };
    }, []);

    const controls: [IAzureMapControls] = [
        {
            controlName: 'ZoomControl',
            options: { position: 'top-right' } as ControlOptions,
        },
    ];

    const memoizedMarkerRender: IAzureDataSourceChildren = useMemo(
        (): any => markers.map((marker) => renderPoint(marker)),
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
