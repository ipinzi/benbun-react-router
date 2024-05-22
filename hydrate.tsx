import { hydrateRoot } from 'react-dom/client';
import {routes} from './routeMap.ts';

// Determine which page to hydrate based on the URL
const currentPage = window.location.pathname;
// Get the component to hydrate
const ComponentToHydrate = routes[currentPage].Page || routes['/'].Page; // Default to Page1 if no match

hydrateRoot(document, <ComponentToHydrate />);