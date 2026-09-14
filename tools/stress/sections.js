// tools/stress — realistic section sources for AD-11's budget measurement.
// Round 1 finding 3: per-section compile cost scales ~7.4x from the spike's toy
// shape (hero-centered: 5 elements, 3 directives) to a realistic section. These
// archetypes are sized from sections-inventory.md: root carries the 3 universal
// controls plus up to 15 design controls (FR-F3), 40-120 elements, several binds,
// a nested repeat, inline SVG icons, and FR-H8 media guards.
// ponytail: 8 archetypes, parameterised by index — not 484 hand-written designs.
// Story 4.9: every chrome literal is a catalog key (data-t / data-t-attr) or a content prop, so the archetypes
// pass V1's tree half (`checkChromeLiterals`, asserted by test-vocabulary.mjs) as every design must.

const icon = (n) =>
  `<svg class="ico ico--${n}" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">` +
  `<path d="M${n} 2 L22 ${n + 2} L12 22 L2 12 Z"/><circle cx="12" cy="12" r="${3 + (n % 5)}"/>` +
  `<rect x="${n}" y="4" width="6" height="6" rx="1"/></svg>`;

// the 3 universal controls + a design's own set, as AD-3 attributes on the root
const controls = (extra) => [
  'data-bg="surface"', 'data-spacing="comfortable"', 'data-divider="line"',
  ...extra,
].join(' ');

const A = {
  // A1 Headers & Navigation — nav repeat + member swap + secondary nav
  header: (i) => `
<section class="d-a1-${i} hdr" ${controls([`data-sticky="sticky-shrink"`, `data-nav-align="end"`, `data-cta="on"`, `data-search="on"`, `data-member-links="on"`, `data-density="regular"`, `data-border="hairline"`, `data-logo-size="md"`, `data-shadow="soft"`, `data-width="wide"`, `data-mobile="drawer"`, `data-caps="off"`])}>
  <div class="hdr__util">
    <ul class="hdr__social">
      ${[1, 2, 3, 4].map((n) => `<li class="hdr__social-item"><a class="hdr__social-link" href="#s${n}" aria-label="Social ${n}" data-prop-attr="aria-label:social${n}.label">${icon(n)}</a></li>`).join('\n      ')}
    </ul>
    <p class="hdr__tag" data-prop="utilityNote">Free weekly issue</p>
  </div>
  <div class="hdr__bar">
    <a class="hdr__logo" href="{{@site.url}}" data-prop-attr="title:logoAlt">
      <img class="hdr__logo-img" data-bind-attr="src:@site.logo|img_url:m" data-empty="hide" src="/logo.png" alt="">
      <span class="hdr__logo-text" data-prop="logoText">Orbit Weekly</span>
    </a>
    <nav class="hdr__nav" data-t-attr="aria-label:a11y.main_navigation">
      <ul class="hdr__list">
        <li class="hdr__item" data-repeat="navigation" data-partial="nav-item-${i}">
          <a class="hdr__link" data-bind-attr="href:url"><span class="hdr__link-text" data-bind="label">Home</span>${icon(2)}</a>
        </li>
      </ul>
    </nav>
    <div class="hdr__actions">
      <button class="hdr__search" type="button" data-t-attr="aria-label:search.trigger_label">${icon(3)}</button>
      <a class="hdr__signin" href="/signin/" data-prop="signinLabel">Sign in</a>
      <a class="hdr__cta button button--primary" data-prop="cta.label" data-prop-attr="href:cta.url">Subscribe</a>
    </div>
  </div>
</section>`,

  // A4 Heroes — split hero, stat row, dual CTA, media guard
  hero: (i) => `
<section class="d-a4-${i} hero" ${controls([`data-align="start"`, `data-media="right"`, `data-ratio="wide"`, `data-eyebrow="on"`, `data-stats="on"`, `data-overlay="scrim"`, `data-height="tall"`, `data-cta-style="pair"`, `data-text-size="xl"`, `data-rule="none"`])}>
  <div class="hero__text">
    <p class="hero__eyebrow" data-prop="eyebrow" data-empty="fallback">Issue 42</p>
    <h1 class="hero__title" data-prop="title">Your headline goes here</h1>
    <p class="hero__sub" data-prop="subtitle" data-empty="fallback">A sentence explaining what this is about.</p>
    <div class="hero__ctas">
      <a class="hero__cta button button--primary" data-prop="cta.label" data-prop-attr="href:cta.url">Get started</a>
      <a class="hero__cta2 button button--ghost" data-prop="cta2.label" data-prop-attr="href:cta2.url">Read a sample</a>
    </div>
    <dl class="hero__stats">
      ${[1, 2, 3].map((n) => `<div class="hero__stat"><dt class="hero__stat-k" data-prop="stat${n}.label">Readers</dt><dd class="hero__stat-v" data-prop="stat${n}.value">12,000</dd></div>`).join('\n      ')}
    </dl>
    <p class="hero__note" data-prop="footnote" data-empty="fallback">No spam. Unsubscribe anytime.</p>
    <ul class="hero__trust">
      ${[1, 2, 3, 4, 5].map((n) => `<li class="hero__trust-item"><img class="hero__trust-img" data-prop-attr="src:trust${n}.src" src="/t${n}.svg" alt="">${icon(n)}</li>`).join('\n      ')}
    </ul>
  </div>
  <figure class="hero__media">
    <img class="hero__img" data-bind-attr="src:@site.cover_image|img_url:l" data-empty="hide" src="/cover.jpg" alt="">
    <figcaption class="hero__cap" data-prop="mediaCaption" data-empty="fallback">Photo credit</figcaption>
  </figure>
</section>`,

  // A17 Post Feeds — feed with a NESTED repeat over each post's tags (§7.3's missing construct)
  feed: (i) => `
<section class="d-a17-${i} feed" ${controls([`data-cols="3"`, `data-gap="normal"`, `data-card="raised"`, `data-image="top"`, `data-excerpt="on"`, `data-meta="author-date"`, `data-tags="on"`, `data-ratio="3-2"`, `data-hover="lift"`, `data-first="feature"`, `data-count="9"`, `data-order="published"`])}>
  <header class="feed__head">
    <h2 class="feed__title" data-prop="title">Latest posts</h2>
    <p class="feed__sub" data-prop="subtitle" data-empty="fallback">Everything we have published.</p>
    <a class="feed__all" data-prop="cta.label" data-prop-attr="href:cta.url">View all</a>
  </header>
  <div class="feed__grid">
    <article class="card" data-repeat="posts" data-repeat-limit="9" data-partial="post-card-${i}">
      <a class="card__img-link" data-bind-attr="href:url">
        <img class="card__img" data-bind-attr="src:feature_image|img_url:m" data-empty="hide" src="/ph.jpg" alt="">
      </a>
      <div class="card__body">
        <ul class="card__tags">
          <li class="card__tag" data-repeat="tags" data-repeat-limit="3">
            <a class="card__tag-link" data-bind-attr="href:url"><span data-bind="name">tag</span></a>
          </li>
        </ul>
        <h3 class="card__title" data-bind="title">A sample post title</h3>
        <p class="card__excerpt" data-bind="excerpt" data-empty="hide">Excerpt.</p>
        <footer class="card__meta">
          <img class="card__avatar" data-bind-attr="src:primary_author.profile_image|img_url:s" data-empty="hide" src="/a.jpg" alt="">
          <span class="card__author" data-bind="primary_author.name">Author</span>
          <time class="card__date" data-bind="published_at|date:D MMM YYYY">14 Mar 2026</time>
          <span class="card__read" data-bind="reading_time">5</span>
        </footer>
      </div>
    </article>
  </div>
</section>`,

  // A7 Pricing / Tiers — repeat over tiers, feature sub-repeat, R2-15's filtered-get hazard surface
  pricing: (i) => `
<section class="d-a7-${i} tiers" ${controls([`data-cols="3"`, `data-highlight="middle"`, `data-cadence="toggle"`, `data-compare="on"`, `data-badge="on"`, `data-currency="symbol"`, `data-border="card"`, `data-align="center"`, `data-cta-style="solid"`])}>
  <header class="tiers__head">
    <h2 class="tiers__title" data-prop="title">Choose a plan</h2>
    <p class="tiers__sub" data-prop="subtitle" data-empty="fallback">Cancel anytime.</p>
  </header>
  <div class="tiers__grid">
    <article class="tier" data-repeat="tiers" data-partial="tier-card-${i}">
      <h3 class="tier__name" data-bind="name">Tier</h3>
      <p class="tier__desc" data-bind="description" data-empty="hide">What you get.</p>
      <p class="tier__price"><span class="tier__amt" data-bind="monthly_price">5</span><span class="tier__per" data-prop="perMonth">/month</span></p>
      <ul class="tier__features">
        <li class="tier__feature" data-repeat="benefits">
          ${icon(4)}<span class="tier__feature-text" data-bind="name">Benefit</span>
        </li>
      </ul>
      <a class="tier__cta button button--primary" href="#/portal/signup" data-prop="tierCta">Subscribe</a>
    </article>
  </div>
  <p class="tiers__note" data-prop="note" data-empty="fallback">Prices in USD.</p>
</section>`,

  // A14 Galleries — grid of figures with captions, lightbox behaviour module
  gallery: (i) => `
<section class="d-a14-${i} gal" ${controls([`data-cols="4"`, `data-gap="tight"`, `data-ratio="square"`, `data-caption="below"`, `data-lightbox="on"`, `data-crop="cover"`, `data-radius="md"`, `data-hover="zoom"`])} data-module="lightbox">
  <h2 class="gal__title" data-prop="title">Gallery</h2>
  <div class="gal__grid">
    ${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<figure class="gal__fig">
      <img class="gal__img" data-prop-attr="src:img${n}.src;alt:img${n}.alt" src="/g${n}.jpg" alt="">
      <figcaption class="gal__cap" data-prop="img${n}.caption" data-empty="fallback">Caption ${n}</figcaption>
    </figure>`).join('\n    ')}
  </div>
</section>`,

  // A22 CTA bands — member-visibility aware
  cta: (i) => `
<section class="d-a22-${i} band" ${controls([`data-align="center"`, `data-media="none"`, `data-show-to="logged-out"`, `data-form="inline"`, `data-size="lg"`, `data-radius="pill"`, `data-emphasis="accent"`])}>
  <div class="band__inner">
    <h2 class="band__title" data-prop="title">Join the list</h2>
    <p class="band__sub" data-prop="subtitle" data-empty="fallback">One email a week.</p>
    <form class="band__form" data-members-form="subscribe">
      <label class="band__label" for="e-${i}" data-prop="emailLabel">Email address</label>
      <input class="band__input" id="e-${i}" type="email" name="email" required data-t-attr="placeholder:member.email_placeholder">
      <button class="band__btn button button--primary" type="submit" data-prop="submitLabel">Subscribe</button>
    </form>
    <ul class="band__proof">
      ${[1, 2, 3, 4].map((n) => `<li class="band__proof-item"><img class="band__avatar" data-prop-attr="src:proof${n}.src" src="/p${n}.jpg" alt="">${icon(n)}</li>`).join('\n      ')}
    </ul>
    <ul class="band__benefits">
      ${[1, 2, 3].map((n) => `<li class="band__benefit">${icon(n)}<span class="band__benefit-text" data-prop="benefit${n}">Benefit</span></li>`).join('\n      ')}
    </ul>
    <p class="band__fine" data-prop="fine" data-empty="fallback">No spam.</p>
  </div>
</section>`,

  // A25 Post Content — the article body, Koenig card surface
  content: (i) => `
<section class="d-a25-${i} article" ${controls([`data-measure="normal"`, `data-drop-cap="on"`, `data-links="underline"`, `data-quote="bar"`, `data-figure="wide"`, `data-toc="none"`])}>
  <header class="article__head">
    <h1 class="article__title" data-bind="title">Post title</h1>
    <p class="article__excerpt" data-bind="custom_excerpt" data-empty="hide">Excerpt.</p>
    <div class="article__meta">
      <img class="article__avatar" data-bind-attr="src:primary_author.profile_image|img_url:s" data-empty="hide" src="/a.jpg" alt="">
      <span class="article__author" data-bind="primary_author.name">Author</span>
      <time class="article__date" data-bind="published_at|date:D MMM YYYY">14 Mar 2026</time>
    </div>
    <img class="article__feature" data-bind-attr="src:feature_image|img_url:l" data-empty="hide" src="/f.jpg" alt="">
  </header>
  <div class="article__body kg-canvas" data-helper="content"></div>
  <footer class="article__foot">
    <ul class="article__share">
      ${[1, 2, 3].map((n) => `<li><a class="article__share-link" href="#sh${n}" data-t-attr="aria-label:post.share">${icon(n)}</a></li>`).join('\n      ')}
    </ul>
    <div class="article__bio">
      <img class="article__bio-img" data-bind-attr="src:primary_author.profile_image|img_url:m" data-empty="hide" src="/a.jpg" alt="">
      <h2 class="article__bio-name" data-bind="primary_author.name">Author</h2>
      <p class="article__bio-text" data-bind="primary_author.bio" data-empty="hide">Bio.</p>
    </div>
    <section class="article__related">
      <h2 class="article__related-title" data-prop="relatedTitle">More like this</h2>
      <ul class="article__related-list">
        <li class="article__related-item" data-repeat="posts" data-repeat-limit="3" data-partial="related-${i}">
          <a class="article__related-link" data-bind-attr="href:url"><span data-bind="title">Title</span></a>
          <time class="article__related-date" data-bind="published_at|date:D MMM YYYY">14 Mar 2026</time>
        </li>
      </ul>
    </section>
  </footer>
</section>`,

  // A3 Footers — multi-column nav repeat + legal row
  footer: (i) => `
<section class="d-a3-${i} ftr" ${controls([`data-cols="4"`, `data-newsletter="on"`, `data-social="on"`, `data-legal="stacked"`, `data-logo="on"`, `data-divider-top="line"`])}>
  <div class="ftr__cols">
    <div class="ftr__brand">
      <img class="ftr__logo" data-bind-attr="src:@site.icon|img_url:s" data-empty="hide" src="/icon.png" alt="">
      <p class="ftr__blurb" data-prop="blurb" data-empty="fallback">A newsletter about building things.</p>
    </div>
    <nav class="ftr__nav" data-t-attr="aria-label:a11y.footer_navigation">
      <ul class="ftr__list">
        <li class="ftr__item" data-repeat="navigation" data-partial="ftr-item-${i}">
          <a class="ftr__link" data-bind-attr="href:url"><span data-bind="label">Link</span></a>
        </li>
      </ul>
    </nav>
    ${[1, 2].map((n) => `<div class="ftr__col">
      <h2 class="ftr__col-title" data-prop="col${n}.title">More</h2>
      <ul class="ftr__col-list">
        ${[1, 2, 3].map((m) => `<li class="ftr__col-item"><a class="ftr__col-link" data-prop="col${n}.link${m}.label" data-prop-attr="href:col${n}.link${m}.url">Item</a></li>`).join('\n        ')}
      </ul>
    </div>`).join('\n    ')}
  </div>
  <div class="ftr__legal">
    <p class="ftr__copy" data-prop="copyright">&copy; Orbit Weekly</p>
    <ul class="ftr__social">
      ${[1, 2, 3].map((n) => `<li><a class="ftr__social-link" href="#f${n}" aria-label="Social ${n}" data-prop-attr="aria-label:social${n}.label">${icon(n)}</a></li>`).join('\n      ')}
    </ul>
  </div>
</section>`,
};

const ORDER = ['header', 'hero', 'feed', 'pricing', 'gallery', 'cta', 'content', 'footer'];

// 40 distinct placed designs for the stress template, cycling the archetypes.
function stressStack(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ kind: ORDER[i % ORDER.length], i: i + 1 });
  return out;
}

const source = ({ kind, i }) => A[kind](i);

module.exports = { A, ORDER, stressStack, source };
