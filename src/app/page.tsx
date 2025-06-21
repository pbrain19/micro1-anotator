import { Suspense } from "react";
import App from "../components/App";

function AppWrapper() {
  return <App />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xl font-semibold text-gray-700">
              Loading...
            </div>
          </div>
        </div>
      }
    >
      <AppWrapper />
    </Suspense>
  );
}
