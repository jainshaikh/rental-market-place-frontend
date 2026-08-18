'use client';

import { TripForm } from '../../../../../components/trips/TripForm';

export default function NewDashboardTripPage() {
  return (
    <TripForm
      cancelHref="/dashboard/trips"
      detailBasePath="/dashboard/trips"
      addVehicleHref="/dashboard/my-vehicles/new"
    />
  );
}
