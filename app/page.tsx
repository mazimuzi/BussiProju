import { MapProvider } from "./map-provider";
import { MapComponent } from "./map";

export default function Home() {

  return (
    <MapProvider>
      <div>
        <p className="text-3xl text-blue-600 font-bold">
          Tailwind toimii!
        </p>

        <MapComponent />
      </div>
    </MapProvider>
  );
}