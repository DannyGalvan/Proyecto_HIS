import { LogoHIS } from '../../components/brand/LogoHIS';

function LoadingPage() {
  return (
    // 'bg-background' o similar para que tome el color de tu tema
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-slate-950">

      {/* El logo ahora es "inteligente", no necesita un div padre que lo fuerce */}
      <LogoHIS width="240px" height="auto" />

      <div className="flex flex-col items-center gap-2">
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          Cargando... Espere
        </p>
        {/* Un pequeño detalle visual opcional */}
        <div className="h-1.5 w-12 rounded-full bg-blue-500/20">
          <div className="h-full w-full animate-loading-bar rounded-full bg-blue-500"></div>
        </div>
      </div>

    </div>
  );
}

export default LoadingPage;