import { MapProvider } from "./map-provider";
import { MapComponent } from "./map";

export default function Home() {

  return (
    <MapProvider>
        <MapComponent />
    </MapProvider>
  );
}