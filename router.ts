import { URLPattern } from 'urlpattern-polyfill';
import { routes } from './routeMap.ts';

export class Router {
  private routeList: Route[] = [];

  constructor() {
    // Add routes from routeMap to routeList
    for (const routesKey in routes) {
      if (routesKey === undefined) continue;

      this.add('GET', routesKey, async req => {
        const stream = await routes[routesKey].GetStream();

        return new Response(stream, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      });
    }
  }

  public add(method: string, pattern: string, handler: Handler): void {
    method = method.toUpperCase();
    const route = new Route(
      method,
      new URLPattern({
        pathname: pattern,
      }),
      handler,
    );
    this.routeList.push(route);
  }

  public async route(req: Request, headers: { 'Set-Cookie': string; 'Content-Type': string }) {
    // Use routeList for all routes
    const response = await this.match(req);
    if (response) {
      response.headers.append('Set-Cookie', headers['Set-Cookie']);
      return response;
    }

    const path = new URL(req.url).pathname;
    const filepath = path.slice(1);
    if (path.startsWith('/public/')) {
      // console.log("Attempting public path: "+filepath);
      return new Response(Bun.file(filepath));
    }
    return new Response('404 page not found.', { headers, status: 404 });
  }

  public async match(request: Request) {
    for (const route of this.routeList) {
      if (request.method === route.method) {
        const result = route.urlPattern.exec(request.url);
        if (result) {
          const response = route.handler(request, result.pathname.groups, result);
          if (response instanceof Response) {
            return response;
          } else {
            return await response;
          }
        }
      }
    }
  }
}

export type URLPatternResultParams = { [key: string]: string | undefined };
type Handler = (
  request: Request,
  params: URLPatternResultParams,
  urlPatternResult: URLPatternResult,
) => Response | Promise<Response>;

class Route {
  constructor(public method: string, public urlPattern: URLPattern, public handler: Handler) {}
}
