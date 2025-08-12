import MapClient from "./MapClient";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  return (
    <main className="h-[100dvh] w-full">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* Mappa a sinistra (2/3) */}
        <section className="order-2 h-[60vh] border-t lg:order-1 lg:h-full lg:border-r">
          <MapClient />
        </section>

        {/* Sidebar a destra (1/3) */}
        <Sidebar />
      </div>
    </main>
  );
}

