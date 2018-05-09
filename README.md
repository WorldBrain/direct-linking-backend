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
**Clone this repo and it's submodules (!):**

```sh
$ git clone https://github.com/WorldBrain/direct-linking-backend.git --recurse-submodules
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

To start styling with an embeddable and non-embeddable page (see Styling section below), execute this command:
```
sh
$ npm run dev -- --dev create-annotation:url=embeddable --dev create-annotation:url=non-embeddable
```

If have tmux and nvm (with Node.js 6) installed, you can execute ./dev.sh which creates one tmux session (dl_prepare) for the TypeScript compiler, and one (dl_devmon) with the devmon command prepared that you can customize and run.

## Deployment

After setting up the AWS and EB CLI as described [here](./docs/aws-management.md), you can deploy a new version by executing one of these commands:
```sh
$ npm run deploy:staging
$ npm run deploy:production
```

## Architecture

On a high-level, the application consists of:
* **Components**: Invidual classes responsible for small tasks, such as extraction of metadata from an HTML page. Collected in a convient contained object in src/components/index.ts.
* **Storage**: The implementation class, of which only one is used, storing and retrieving the data processed by the back-end, with implementation for in-memory (for unit tests and local dev), on-disk (local dev) and AWS (staging and prod) storage. This storage object being the single point of data storage and retrieval, is one of the components.
* **Controllers**: Business logic independent of specific storage engines or protocols such as HTTP, with storage and components as injected dependencies, constructed in src/controllers/index.ts.
* **Express app and routes**: Handle routing to right controllers, unpacking parameters from HTTP request, and wrapping response data in JSON, HTTP, etc.
* **Dev shortcuts**: Configurable routines for repetitive actions to test the application while developing. These are triggered and configured by passing in one or more --dev commands.

This seperation allows every component to be unit/integration tested with various levels of isolation. In main.ts, you can see how these parts are glued together  :)

## Front-end

Currently, the front-end consist of:
* The HTML template, which has some simple data replaced, marked with $TITLE$, $URL$ and $QUOTE$ tags
* The CSS, preprocessed with precss and postcss in dev-server.ts
* The JS, compiled through Browserify & Babel

When editing the CSS, please edit assets/src/styles.less (not actually LESS, but named as such to make IDE happy.) The JS is edited in assets/src/js, with main.js being the main entry point. The HTML and images can be directly edited in assets/build/.

### Styling (direct link page)

The Direct Link page has two versions: 1) a page that annotates an embeddable source, displaying the Memex bar on top of an iFrame with the source embedded, and 2) a page that annotates a non-embeddable source, taking up the whole page and displaying a Copy Quote and Go to Page button.

When the page is loaded initially, it's empty with just the script and the CSS loaded, with a loading CSS class attached to the body. This is an opportunity to show a loading indicator while the rest of the data is loaded. After this, the inner HTML is loaded and either a content-embeddable or content-not-embeddable CSS class is attached to the body, and the loading CSS class is removed.

### Styling (demo page)

The Direct Linking demo can be found at http://localhost:3000/demo . 

## Conventions

**Type declarations**: Types are defined on the most-local level. If type is only used by one function/class, it's stored in the same file. If it's used specific to one module, it's stored there (see src/components/storage/types.ts). If there's a type that concerns the whole program, it's stored in the root types/ directory (like src/types/annotations.ts).
