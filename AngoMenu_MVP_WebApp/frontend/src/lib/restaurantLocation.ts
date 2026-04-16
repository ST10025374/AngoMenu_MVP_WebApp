import type { Restaurant } from './api';

type RestaurantLocationFields = Pick<
    Restaurant,
    'location' | 'city' | 'province' | 'municipality' | 'neighborhood' | 'streetName'
>;

function cleanValue(value?: string | null): string {
    return value?.trim() ?? '';
}

function pushUnique(values: string[], value: string): void {
    if (!value) return;

    const normalized = value.toLocaleLowerCase();
    const exists = values.some((entry) => entry.toLocaleLowerCase() === normalized);
    if (!exists) {
        values.push(value);
    }
}

export type RestaurantLocationDisplay = {
    multiline: string[];
    singleLine: string;
};

export function formatRestaurantLocation(location: RestaurantLocationFields): RestaurantLocationDisplay {
    const neighborhood = cleanValue(location.neighborhood);
    const municipality = cleanValue(location.municipality);
    const province = cleanValue(location.province);
    const streetName = cleanValue(location.streetName);
    const city = cleanValue(location.city);
    const genericLocation = cleanValue(location.location);

    const hasStructuredFields = Boolean(neighborhood || municipality || province);
    const multiline: string[] = [];
    const singleLineParts: string[] = [];

    if (hasStructuredFields) {
        const firstLineParts: string[] = [];
        pushUnique(firstLineParts, neighborhood);
        pushUnique(firstLineParts, municipality);

        if (firstLineParts.length > 0) {
            const firstLine = firstLineParts.join(', ');
            multiline.push(firstLine);
            pushUnique(singleLineParts, neighborhood);
            pushUnique(singleLineParts, municipality);
        }

        if (province) {
            multiline.push(province);
            pushUnique(singleLineParts, province);
        }
    } else {
        const fallbackParts: string[] = [];
        pushUnique(fallbackParts, city);
        pushUnique(fallbackParts, genericLocation);

        if (fallbackParts.length > 0) {
            multiline.push(fallbackParts.join(', '));
            for (const part of fallbackParts) {
                pushUnique(singleLineParts, part);
            }
        }
    }

    if (streetName) {
        multiline.push(streetName);
        pushUnique(singleLineParts, streetName);
    }

    if (singleLineParts.length === 0) {
        const emergencyFallback = [genericLocation, city, province, municipality, neighborhood, streetName];
        for (const part of emergencyFallback) {
            pushUnique(singleLineParts, part);
        }
    }

    const singleLine = singleLineParts.join(', ');

    return {
        multiline: multiline.filter(Boolean),
        singleLine,
    };
}