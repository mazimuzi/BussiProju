import { MapProvider } from "./map-provider";
import { MapComponent } from "./map";

export default function Home() {
  return (
    <div className="flex h-screen flex-col md:flex-row bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="md:w-80 w-full md:h-full h-72 border-r md:border-r md:border-b-0 border-b bg-white/80 backdrop-blur-sm shadow-sm p-4 flex flex-col">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Lähdöt läheltäsi</h1>
          <p className="text-sm text-gray-500">
            Näet seuraavat bussit lähimmältä pysäkiltäsi.
          </p>
        </header>

        {/* Hakunappi tms. – myöhemmin oikea toiminnallisuus */}
        <button className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
          Hae sijainti
        </button>

        {/* Lista (placeholder toistaiseksi) */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">550</span>
              <span className="text-sm font-semibold text-gray-700">3 min</span>
            </div>
            <p className="text-sm text-gray-500">Itäkeskus</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">56</span>
              <span className="text-sm font-semibold text-gray-700">7 min</span>
            </div>
            <p className="text-sm text-gray-500">Keskusta</p>
          </div>

          {/* Lisää myöhemmin oikeat datakortit tähän */}
        </div>
      </aside>

      {/* KARTTA-ALUE */}
      <main className="flex-1 relative">
        <MapProvider>
          <MapComponent />
        </MapProvider>

        {/* Kartan päälle tuleva overlay (esim. info / nappi) */}
        <div className="pointer-events-none absolute left-4 top-4 z-10">
          <div className="pointer-events-auto rounded-xl bg-white/90 px-4 py-2 shadow">
            <p className="text-sm font-medium text-gray-700">
              Kartta näyttää sijaintisi ja lähimmän pysäkin.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}