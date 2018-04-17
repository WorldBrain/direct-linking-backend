# Memex Direct Linking backend

This repository contains the backend for Memex's Direct Linking feature. It consists of the following parts:
* The HTTP (Express) server that stores annotation and relevant page data on the (S3) CDN.
* The client side app that renders the annotation link page
* The deployment procedures to deploy this on AWS EB

## High-level functionality

The user flow is as follows:
1. A user creates a highlight in the Memex extension
1. The Direct Link button is clicked
1. The page URL and highlight anchor sent to the server, which saves relevant data and generates a URL to share
1. The user shares this link through e-mail, socal media, etc.
1. People clicking the link without having Memex installed get to see a preview of the page and the highlight, with the option to go to the original page, or install Memex

This means the following assumptions on a technical level:
* Expect high read to write ratio, with a high probability each individual link gets a lot of visits
* We need to retrieve the original page to extract metadata like title and preview image, which may require lots of waiting on IO

Please refer to these issues for relevant discussions on this feature:
* [Direct Linking](https://github.com/WorldBrain/Memex/issues/236)
* [Comments & Annotations](https://github.com/WorldBrain/Memex/issues/301)

Technical design choices:
* Due to the high read to write ratio, the cheapest way to run would be to serve all annotation links directly from a CDN, rendering everything client-side so the skin and functionality of the annotation link page can be updated without updating files for every annotation link on the site. Facebook however, can only extract metadata for link previews right from the HTML, without dynamically rendering the page. To deal with this limitation, we generate a 'skeleton page' containing only the metadata and links to the JS and CSS, after which the content is rendered dynamically.
* Currently, this backend is ran on AWS EB & S3. Due to the time spent waiting on IO from external servers, using FaaS services as Lambda could be too expensive, but this needs to be tested.

To see on a high level what happens when an annotation link is created, see [this file](https://github.com/WorldBrain/direct-linking-backend/blob/master/src/controllers/annotations.ts) and its integration test located in the same directory.

## Installation & usage

**This assumes a basic knowledge of `git`, `npm` and usage of the `command line`. Furthermore, this project is tested on Node.js version 6, which can be installed with NVM.**

### First steps:
**Clone this repo:**

```sh
$ git clone https://github.com/WorldBrain/Memex
```

**Run `npm install` to install dependencies**
```sh
$ npm install
```
**This could take a while....**

### Running the server locally:

This project uses TypeScript, so to develop you need to start the incremental compiler in one terminal:
```sh
$ npm run prepare:watch
```

Then in another terminal, execute the following command to run the development server:
```sh
$ npm run devmon
```

This will automatically restart the server when a change has been made to it's code. Also, the HTML&CSS of the direct linking page front-end is live-reloaded.

If you want to automatically create a new annotation link when the server starts up, either to rapidly test your changes to its internals, or start hacking on the front-end, you can use the one of the following commands:
```sh
$ npm run devmon -- --dev create-annotation
$ npm run devmon -- --dev create-annotation:url='https://my-custom-url/'
$ npm run devmon -- --dev create-annotation:id=my-custom-annotation-id,url='https://my-custom-url/'
```

If have tmux installed, you can execute ./dev.sh which creates one tmux session (dl_prepare) for the TypeScript compiler, and one (dl_devmon) with the devmon command prepared that you can customize and run.

## Architecture

On a high-level, the application consists of:
* **Storage**: The classes storing and retrieving the data processed by the back-end, with implementation for in-memory (for unit tests and local dev), on-disk (local dev) and AWS (staging and prod) storage.
* **Components**: Invidual classes responsible for small tasks, such as extraction of metadata from an HTML page. Collected in a convient contained object in src/components/index.ts.
* **Controllers**: Business logic independent of specific storage engines or protocols such as HTTP, with storage and components as injected dependencies, constructed in src/controllers/index.ts.
* **Express app and routes**: Handle routing to right controllers, unpacking parameters from HTTP request, and wrapping response data in JSON, HTTP, etc.
* **Dev shortcuts**: Configurable routines for repetitive actions to test the application while developing. These are triggered and configured by passing in one or more --dev commands.

This seperation allows every component to be unit/integration tested with various levels of isolation. In main.ts, you can see how these parts are glued together  :)

## Front-end

Currently, the front-end consist of:
* The HTML template, which has some simple data replaced, marked with $TITLE$, $URL$ and $QUOTE$ tags
* The CSS, preprocessed with precss and postcss in dev-server.ts
* The JS, currently not transpiled

When editing the CSS, please edit assets/src/styles.less (not actually LESS, but named as such to make IDE happy.) The HTML and JS can be directly edited in assets/build/.
