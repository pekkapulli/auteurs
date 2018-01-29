import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Helmet from 'react-helmet';

const gaScript = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-65400709-3');`;

export function DOCUMENT(
  helmetComponent: React.ReactElement<any>,
  app?: JSX.Element,
) {
  ReactDOMServer.renderToString(helmetComponent);

  const renderedApp = {
    __html: app ? ReactDOMServer.renderToString(app) : '',
  };
  const helmet = Helmet.renderStatic();

  const htmlAttributes = helmet.htmlAttributes.toComponent();
  const bodyAttributes = helmet.bodyAttributes.toComponent();

  return (
    <html {...htmlAttributes}>
      <head>
        {helmet.title.toComponent()}
        <script
          async={true}
          src="https://www.googletagmanager.com/gtag/js?id=UA-65400709-3"
        />
        <script dangerouslySetInnerHTML={{ __html: gaScript }} />
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
      </head>
      <body {...bodyAttributes}>
        <div id="content" dangerouslySetInnerHTML={renderedApp} />
        {helmet.script.toComponent()}
        <script dangerouslySetInnerHTML={{ __html: gaScript }} />
      </body>
    </html>
  );
}

export function getAssets(compilation: any, chunks: any) {
  // Use the configured public path or build a relative path
  let publicPath = compilation.options.output.publicPath;

  if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
    publicPath += '/';
  }
  const assets = {
    // Will contain all js & css files by chunk
    chunks: {} as { [chunkName: string]: any },
    // Will contain all js files
    js: [] as string[],
    // Will contain all css files
    css: [] as string[],
    // Will contain the html5 appcache manifest files if it exists
    manifest: Object.keys(compilation.assets).filter(f =>
      f.match(/\.appcache$/),
    )[0],
  };

  for (const chunk of chunks) {
    const chunkName = chunk.names ? chunk.names[0] : chunk.name;

    assets.chunks[chunkName] = {};

    // Prepend the public path to all chunk files
    const chunkFiles = []
      .concat(chunk.files)
      .map(chunkFile => publicPath + chunkFile);

    // Webpack outputs an array for each chunk when using sourcemaps
    // But we need only the entry file
    const entry = chunkFiles[0];
    assets.chunks[chunkName].size = chunk.size;
    assets.chunks[chunkName].entry = entry;
    assets.chunks[chunkName].hash = chunk.hash;
    assets.js.push(entry);

    // Gather all css files
    const css = chunkFiles.filter(chunkFile => /.css($|\?)/.test(chunkFile));
    assets.chunks[chunkName].css = css;
    assets.css = assets.css.concat(css);
  }

  // Duplicate css assets can occur on occasion if more than one chunk
  // requires the same css.
  // assets.css = _.uniq(assets.css);

  return assets;
}

export function contextToHelmet(webpackCompilation: any) {
  const assets = getAssets(webpackCompilation, webpackCompilation.chunks);

  // const fbImage = require('../images/og-syrjassa.png');
  // const twitterImage = require('../images/twitter-syrjassa.png');

  // tslint:disable:max-line-length
  return (
    <Helmet defaultTitle="Auteurs">
      <html lang="en" />
      {assets.css.map((href: string) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {/*<link rel="canonical" href="https://www.lucify.com/something" />*/}
      {assets.js.map((src: string) => (
        <script key={src} type="text/javascript" src={src} />
      ))}
      <meta {...{ charset: 'utf-8' } as any} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <meta
        name="description"
        content="Me-säätiön syrjässä-työkalu tarjoaa jatkuvasti päivittyvät tiedot kunnittaisesta työttömyydestä, pitkäaikaistyöttömyydestä ja nuorten työttömyydestä."
      />
      <meta itemProp="name" content="Me-data: Syrjässä" />
      <meta
        itemProp="description"
        content="Me-säätiön syrjässä-työkalu tarjoaa jatkuvasti päivittyvät tiedot kunnittaisesta työttömyydestä, pitkäaikaistyöttömyydestä ja nuorten työttömyydestä."
      />
      {/* <meta itemProp="image" content={`http://data.mesaatio.fi${fbImage}`} /> */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@mesaatio" />
      <meta name="twitter:title" content="Me-data: Syrjässä" />
      <meta
        name="twitter:description"
        content="Me-säätiön syrjässä-työkalu tarjoaa jatkuvasti päivittyvät tiedot kunnittaisesta työttömyydestä, pitkäaikaistyöttömyydestä ja nuorten työttömyydestä."
      />
      <meta name="twitter:creator" content="@mesaatio" />
      {/* <meta
        name="twitter:image:src"
        content={`http://data.mesaatio.fi${twitterImage}`}
      /> */}
      <meta property="og:title" content="Me-data: Syrjässä" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="http://data.mesaatio.fi/syrjassa/" />
      {/* <meta property="og:image" content={`http://data.mesaatio.fi${fbImage}`} /> */}
      <meta
        property="og:description"
        content="Me-säätiön syrjässä-työkalu tarjoaa jatkuvasti päivittyvät tiedot kunnittaisesta työttömyydestä, pitkäaikaistyöttömyydestä ja nuorten työttömyydestä."
      />
      <meta property="og:site_name" content="Me-data" />
    </Helmet>
  );
}
