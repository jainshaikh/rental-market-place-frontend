'use client';

import { MyVehiclesList } from '../../../../components/user-vehicles/MyVehiclesList';

export default function ProviderMyVehiclesPage() {
  return <MyVehiclesList basePath="/provider/my-vehicles" newHref="/provider/my-vehicles/new" />;
}
