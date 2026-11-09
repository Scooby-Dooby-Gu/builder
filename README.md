# Builder

A component builder prototype: a component library, a style guide (fonts, colors, typography), and a visual editor for composing components and mapping them to JSON data sources.

Built with [Next.js](https://nextjs.org/) 12, React 18, Redux Toolkit, [Chakra UI](https://chakra-ui.com/) 1.x, and a custom [CKEditor 5](https://ckeditor.com/ckeditor-5/) build.

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

`NODE_OPTIONS=--openssl-legacy-provider` is needed on Node 17 and later, because Next.js 12 uses an older webpack hashing setup. On Node 16 you can leave it out.

## Tests

```bash
npm test
```

Runs the state machine tests in `lib/machines` with Node's built-in test runner. See `lib/machines/README.md` for the machines and the `data-*` state attributes the UI exposes.

## Project layout

- `pages/`: routes for the component library (`/components`), the builder (`/components/[id]`), the style guide (`/styles`), and data sources (`/datasources`)
- `components/`: UI, grouped by area (`library`, `builder`, `styles`), plus the shared UI layer in `components/ui`
- `store/`: Redux slices and async actions
- `ckeditor5/`: the custom CKEditor 5 build used by the builder. The compiled bundle is committed in `ckeditor5/build`, so you only need to rebuild it when changing the editor plugins.
- `data/`: sample collections, fonts, and colors
