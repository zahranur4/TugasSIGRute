import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.16/mapmarker.js";

const info = document.getElementById("info");

createMap("peta", { center: [107.584, -6.8927], zoom: 14 });

getGeoJSON("route.geojson", (response) => {
    if (!response.data) {
        info.textContent = "Gagal membaca route.geojson, status: " + response.status;
        return;
    }

    const fitur = response.data.features;
    const rute = fitur.find((f) => f.properties.kind === "route");

    // gambar hanya rute (area polygon tidak perlu tampil di peta)
    addGeoJSON("peta", { type: "FeatureCollection", features: [rute] }, {
        style: { stroke: "#00aa13", strokeWidth: 6 },
        popup: (f) => {
            const p = f.properties;
            let teks = p.name + " | Tarif Rp" + p.fare_idr.toLocaleString("id-ID");
            if (p.distance_m) teks += " | " + (p.distance_m / 1000).toFixed(2) + " km";
            return teks;
        },
    });

    // marker awal & tujuan
    fitur.filter((f) => f.properties.kind === "start" || f.properties.kind === "finish")
        .forEach((f) => {
            addMarker("peta", f.geometry.coordinates, {
                label: f.properties.name,
                popup: f.properties.kind === "start" ? "Titik jemput: " + f.properties.name : "Tujuan: " + f.properties.name,
                color: f.properties.kind === "start" ? "#00aa13" : "#dc2626",
            });
        });

    fitMap("peta", rute);

    const p = rute.properties;
    info.textContent = p.distance_m
        ? (p.distance_m / 1000).toFixed(2) + " km, sekitar " + Math.round(p.duration_s / 60) + " menit"
        : "Jalankan fetch_route.js untuk rute jalan asli";
});
