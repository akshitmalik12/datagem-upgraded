import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070A] text-gray-100">
      <SEO 
        title="404 - Page Not Found | DataGem" 
        description="The page you are looking for does not exist."
        path="/404"
      />
      <div className="text-center p-8 bg-[#0B0F19] border border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
        <h1 className="text-8xl font-bold mb-4 text-gray-800 dark:text-gray-200 tracking-tighter">404</h1>
        <h2 className="text-2xl font-semibold mb-6 text-sky-400">Page not found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The autonomous AI analyst couldn't locate this route in your workspace. 
          It might have been moved or deleted.
        </p>
        <Link 
          to="/chat" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
