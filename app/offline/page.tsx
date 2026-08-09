export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold">Sin conexión</h1>
      <p className="text-sm text-zinc-500">
        HealthFit necesita conexión a internet para registrar comidas y ver tus
        datos.
      </p>
    </div>
  );
}
