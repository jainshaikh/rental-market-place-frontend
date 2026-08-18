'use client';

import { TripForm } from '../../../../../components/trips/TripForm';

export default function NewProviderTripPage() {
  return (
    <TripForm
      cancelHref="/provider/trips"
      detailBasePath="/provider/trips"
      addVehicleHref="/provider/my-vehicles/new"
    />
  );
}
