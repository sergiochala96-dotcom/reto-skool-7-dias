// Se muestra al instante al cambiar de página dentro del panel, mientras llegan los datos. El menú
// ya está en pantalla (lo pone el layout), así que solo se anima el contenido.
export default function DashboardLoading() {
  return (
    <main
      className="min-w-0 flex-1 px-4 pb-10 pt-6 md:px-6 md:py-5"
      aria-busy="true"
      aria-label="Cargando"
    >
      <div className="mx-auto max-w-2xl animate-pulse md:max-w-3xl">
        <div className="mx-auto mb-8 h-8 w-56 rounded-xl bg-white/[0.08]" />
        <div className="h-16 rounded-2xl bg-white/[0.07]" />
        <div className="mt-6 space-y-4">
          <div className="h-32 rounded-2xl bg-white/[0.05]" />
          <div className="h-32 rounded-2xl bg-white/[0.05]" />
          <div className="h-32 rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    </main>
  );
}
