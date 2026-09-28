import { Link } from 'react-router-dom';

export default function Breadcrumbs({ paths }) {
  return (
    <nav className="flex items-center text-sm text-gray-400 mb-6">
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        return (
          <div key={path.name} className="flex items-center">
            {isLast ? (
              <span className="font-medium text-gray-100">{path.name}</span>
            ) : (
              <>
                <Link to={path.url} className="hover:text-sky-400 transition-colors">
                  {path.name}
                </Link>
                <svg className="w-4 h-4 mx-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
