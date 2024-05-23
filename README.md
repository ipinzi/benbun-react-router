# Ben Bun - React Router

Ben Bun React Router is a Bun library for delivering server side rendered content via server only routes while maintaining React's ability to rehydrate the DOM.

Ben Bun will automatically handle all of your React page's routes as well as your GET and POST API routes or any other route you want using the correct path syntax.

## Setup

Simply create a "react-routes.js" file at the root directory of your Bun project to automatically manage the React Pages of your frontend.

The React component that you export from your tsx file must be a "Page" component as this is what Ben Bun uses to bind your pages to routes using your react-routes.js file.

Your "react-routes.js" should be formatted like this and located in your root directory:

```typescript
export default {
  "/": require("./pages/index.tsx"),
  "/secondRoute": require("./pages/index2.tsx"),
  "/thirdRoute": require("./pages/index3.tsx"),
};
```
You can include as many routes and pages as you like.

Here is an example of a Ben Bun React Page:

```tsx
//Import readable stream from react for server side rendering
import { renderToReadableStream } from "react-dom/server";
import React, { useState } from 'react';

export function CounterButton() {
    const [count, setCount] = useState(0);

    return (
        <button onClick={() => setCount(count + 1)}>
            Clicked {count} times
        </button>
    );
}
export function Page(){
    return(
        <html>
            <head>
                <title>Button Page</title>
            </head>
            <body>
                <CounterButton />
            </body>
        </html>
    )
}

//Create a pipable stream that is read by the client
export function GetStream() {
    return renderToReadableStream(
        <Page />, {
            bootstrapModules: ['./public/js/hydrate.js'],
        });
}

```

Every parent component added to the "react-routes.js" must be a "Page" and inside the "GetStream()" function otherwise Ben Bun will not be able to route to the component properly.
The GetStream function is used to send the html data to the client.

## How to use

Example Usage:

```typescript
import {Router, Build} from "benbun-react-router";

//Router must inject the routes before building frontend to sync react
export const router = new Router();
//Build the needed frontend file for react hydration
await Build();

const server = Bun.serve({
    fetch(req, server) {

        const headers = {"Set-Cookie": "I generally send the session cookie here!", "Content-Type": "text/html; charset=utf-8"}
        
        //BenBun routing applied here
        return router.route(req, headers);
    },
    error(error) {
        return new Response('404 page not found.', {headers: {"Content-Type": "text/html; charset=utf-8"}, status: 404});
    }
});
```

Use as you like, I made this because I couldn't find something that did what Ben Bun does.
I just wanted server side routing with automatic client side hydration.

You can also add any kind of route you want:
```typescript
router.add("GET", "/your-route", (request,params,urlPatternResult)=>{
    return new Response("The GET Route");
});
router.add("POST", "/post-route", (request,params,urlPatternResult)=>{
    return new Response({key: "value"} as any);
});
```

## Disclaimer

I am not a web developer (anymore) by trade, I'm a game developer. Therefor I may have overlooked some small things.
Do not hesitate to get in touch and let me know if there are any improvements that can be made!