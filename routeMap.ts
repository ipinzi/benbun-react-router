import { FC } from 'react';
import { ReactDOMServerReadableStream } from 'react-dom/server';

export const routes: RouteMap = require('../../react-routes').default;

// Define a type for the routes
type RouteMap = {
  [key: string]: {
    Page: FC<any>;
    GetStream: () => Promise<ReactDOMServerReadableStream>;
  };
};
