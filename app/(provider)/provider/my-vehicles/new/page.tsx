'use client';

import { UserVehicleForm } from '../../../../../components/user-vehicles/UserVehicleForm';

export default function NewProviderPersonalVehiclePage() {
  return <UserVehicleForm cancelHref="/provider/my-vehicles" successHref="/provider/my-vehicles" />;
}
