// The starter component library: sections found on modern marketing sites.
//
// Every variant uses only markup the builder's editor produces: headings, text,
// buttons (a link in a paragraph with a Button style), lists, quotes, images,
// containers with Layout and Surface styles, and data bindings (repeat, text
// variables, image sources, links and visibility). Data-bound sections read from
// the sample data sources in data/datasources.ts. The brand is the placeholder
// "Acme"; people and companies are fictional.

import type {ComponentVariant} from "../models/builder";

// Collapse whitespace between tags so the HTML matches what the editor outputs.
const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((out, s, i) => out + s + (i < values.length ? String(values[i]) : ""), "")
        .replace(/>\s+</g, "><")
        .replace(/\s+\n\s*/g, " ")
        .trim();

// A data variable, as the editor writes it.
const v = (path: string, placeholder: string) =>
    `<var class="var" data-path="${path}" data-path-placeholder="${placeholder}">&nbsp;</var>`;

const variant = (id: string, name: string, content: string): ComponentVariant =>
    ({id, name, state: "new", isDeleted: false, isValid: true, content});

const icon = (name: string) => `<figure class="image"><img src="/marketing/icons/${name}.svg" alt=""></figure>`;

// ------------------------------------------------------------------ heroes

const hero = [
    variant("centered", "Centered with screenshot", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">New: themes and live data</p>
                <h2 class="typography-heading">Launch marketing pages without waiting on a deploy</h2>
                <p class="typography-copy">Acme turns your design system and your data into pages anyone on the team can build, preview and publish.</p>
                <p class="button"><a href="#get-started">Start for free</a></p>
                <p class="button-secondary"><a href="#demo">Book a demo</a></p>
                <p class="typography-small">Free for small teams. No credit card required.</p>
            </div>
            <figure class="image"><img src="/marketing/hero-dashboard.svg" alt="The Acme dashboard showing traffic, signups and top pages"></figure>
        </div>`),
    variant("split", "Split with product shot", html`
        <div class="container spacing-large layout-split">
            <div class="container">
                <p class="typography-accent">Visual page builder</p>
                <h2 class="typography-heading">Pages that update themselves</h2>
                <p class="typography-copy">Bind sections to your product catalog, pricing or events. When the data changes, every page that uses it does too.</p>
                <p class="button"><a href="#get-started">Get started</a></p>
                <p class="button-link"><a href="#how-it-works">See how it works</a></p>
            </div>
            <figure class="image"><img src="/marketing/feature-builder.svg" alt="The Acme editor with a repeating product grid"></figure>
        </div>`),
];

// ------------------------------------------------------------------ social proof

const logos = ["halcyon", "brightpath", "quanta", "vertexlabs", "orbit", "kitebird"];
const logoNames: Record<string, string> = {halcyon: "Halcyon", brightpath: "Brightpath", quanta: "Quanta", vertexlabs: "Vertex Labs", orbit: "Orbit", kitebird: "Kitebird"};

const logoCloud = [
    variant("row", "Logo row", html`
        <div class="container spacing-regular">
            <div class="container layout-center">
                <p class="typography-small">Trusted by fast-moving marketing teams</p>
                <div class="container layout-row">
                    ${logos.map(l => `<figure class="image"><img src="/marketing/logos/${l}.svg" alt="${logoNames[l]}"></figure>`).join("")}
                </div>
            </div>
        </div>`),
];

const testimonials = [
    variant("grid", "Quote grid", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">Customer stories</p>
                <h2>Teams ship faster with Acme</h2>
            </div>
            <div class="container layout-columns-3">
                <div class="container card" data-path-scope="2.stories.items.*">
                    <blockquote><p>${v("2.stories.items.*.quote", "Quote")}</p></blockquote>
                    <div class="container layout-row">
                        <figure class="image" data-path-src="2.stories.items.*.avatar"><img src="/marketing/avatars/priya-raman.svg" alt="Customer photo"></figure>
                        <div class="container">
                            <p><strong>${v("2.stories.items.*.name", "Name")}</strong></p>
                            <p class="typography-small">${v("2.stories.items.*.role", "Role")}, ${v("2.stories.items.*.company", "Company")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`),
    variant("spotlight", "Spotlight quote", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <figure class="image"><img src="/marketing/logos/halcyon.svg" alt="Halcyon"></figure>
                <blockquote><p>We went from a two-week handoff to launching campaign pages the same afternoon. Our designers set the rules once, and everyone else just builds.</p></blockquote>
                <figure class="image"><img src="/marketing/avatars/priya-raman.svg" alt="Priya Raman"></figure>
                <p><strong>Priya Raman</strong></p>
                <p class="typography-small">Head of Growth, Halcyon</p>
            </div>
        </div>`),
];

const stats = [
    variant("tinted", "Stats on a tinted panel", html`
        <div class="container spacing-regular">
            <div class="container card-tint">
                <div class="container layout-columns-4">
                    <div class="container"><h2 class="typography-heading">3×</h2><p class="typography-small">faster page launches</p></div>
                    <div class="container"><h2 class="typography-heading">40%</h2><p class="typography-small">less time in design reviews</p></div>
                    <div class="container"><h2 class="typography-heading">12k</h2><p class="typography-small">pages published each month</p></div>
                    <div class="container"><h2 class="typography-heading">99.9%</h2><p class="typography-small">embed uptime</p></div>
                </div>
            </div>
        </div>`),
];

// ------------------------------------------------------------------ features

const featureGrid = [
    variant("cards", "Three cards", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">Why Acme</p>
                <h2>Everything you need to ship on-brand pages</h2>
                <p class="typography-copy">A visual editor, a shared style guide and live data, in one place.</p>
            </div>
            <div class="container layout-columns-3">
                <div class="container card">${icon("bolt")}<h3>Publish in minutes</h3><p>Build a section, preview it at every breakpoint and publish with one click. No tickets, no deploys.</p></div>
                <div class="container card">${icon("database")}<h3>Connected to your data</h3><p>Repeat cards over a product feed, pricing table or event list, and keep every page current.</p></div>
                <div class="container card">${icon("palette")}<h3>Always on brand</h3><p>Colors, type and components come from one style guide, so every page looks like it belongs.</p></div>
            </div>
        </div>`),
    variant("icons", "Six features with icons", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <h2>Built for the way marketing teams work</h2>
            </div>
            <div class="container layout-columns-3">
                <div class="container">${icon("bolt")}<h3>Instant publishing</h3><p>Changes go live on every site that embeds the component.</p></div>
                <div class="container">${icon("layers")}<h3>Reusable sections</h3><p>Save variants once and reuse them across campaigns.</p></div>
                <div class="container">${icon("database")}<h3>Live data</h3><p>Bind text, images and links to any data source.</p></div>
                <div class="container">${icon("palette")}<h3>Themes</h3><p>Switch a whole page's look by choosing a different theme.</p></div>
                <div class="container">${icon("devices")}<h3>Responsive by default</h3><p>Preview every breakpoint before you publish.</p></div>
                <div class="container">${icon("shield")}<h3>Safe embeds</h3><p>Components render in isolation and can't break the host page.</p></div>
            </div>
        </div>`),
];

const featureText = html`
    <div class="container">
        <p class="typography-accent">Live data</p>
        <h2>One edit to the data, every page updated</h2>
        <p class="typography-copy">Connect a section to your catalog or pricing once. Acme repeats it for every item and fills in the details for you.</p>
        <ul>
            <li>Repeat cards for each product, plan or event</li>
            <li>Bind images, links and visibility, not just text</li>
            <li>Preview with sample data before you publish</li>
        </ul>
        <p class="button-link"><a href="#data">Learn about data sources</a></p>
    </div>`;
const featureImage = `<figure class="image"><img src="/marketing/feature-builder.svg" alt="A product grid repeating over live data in the Acme editor"></figure>`;

const featureHighlight = [
    variant("image-right", "Image on the right", html`<div class="container spacing-large layout-split">${featureText}${featureImage}</div>`),
    variant("image-left", "Image on the left", html`<div class="container spacing-large layout-split">${featureImage}${featureText}</div>`),
];

// ------------------------------------------------------------------ conversion

const pricing = [
    variant("cards", "Plan cards", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">Pricing</p>
                <h2>Simple plans that grow with you</h2>
                <p class="typography-copy">Start free. Upgrade when your team needs more sites and live data.</p>
            </div>
            <div class="container layout-columns-3">
                <div class="container card" data-path-scope="0.pricing.plans.*">
                    <p class="typography-accent" data-path-hidden="0.pricing.plans.*.isStandard">Most popular</p>
                    <h3>${v("0.pricing.plans.*.name", "Plan")}</h3>
                    <p class="typography-small">${v("0.pricing.plans.*.summary", "Summary")}</p>
                    <h2>${v("0.pricing.plans.*.price", "Price")}</h2>
                    <p class="typography-small">${v("0.pricing.plans.*.period", "Period")}</p>
                    <p class="button" data-path-href="0.pricing.plans.*.ctaUrl"><a href="#">Choose plan</a></p>
                    <ul><li data-path-scope="0.pricing.plans.*.features.*">${v("0.pricing.plans.*.features.*", "Feature")}</li></ul>
                </div>
            </div>
        </div>`),
];

const cta = [
    variant("dark", "Dark band", html`
        <div class="container spacing-regular">
            <div class="container card-dark">
                <div class="container layout-center">
                    <h2>Ready to launch your next page?</h2>
                    <p class="typography-copy">Start free and publish your first component today. Bring your own data whenever you're ready.</p>
                    <p class="button"><a href="#signup">Start for free</a></p>
                    <p class="button-secondary"><a href="#sales">Talk to sales</a></p>
                </div>
            </div>
        </div>`),
    variant("split", "Split on a tinted panel", html`
        <div class="container spacing-regular">
            <div class="container card-tint layout-split">
                <div class="container">
                    <h2>See Acme with your own content</h2>
                    <p>We'll build a page from your design system and data in a 30-minute call.</p>
                </div>
                <div class="container">
                    <p class="button"><a href="#demo">Book a demo</a></p>
                    <p class="button-link"><a href="#pricing">Compare plans</a></p>
                </div>
            </div>
        </div>`),
];

const faq = [
    variant("columns", "Two columns", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">FAQ</p>
                <h2>Questions, answered</h2>
            </div>
            <div class="container layout-columns-2">
                <div class="container"><h3>Do I need a developer to publish?</h3><p>No. Anyone on the team can build and publish. A developer adds the embed code to your site once.</p></div>
                <div class="container"><h3>Where does the data come from?</h3><p>Any JSON source: a product feed, a spreadsheet export or your CMS. Sections update when the data does.</p></div>
                <div class="container"><h3>Will it match our brand?</h3><p>Yes. Components use your style guide and themes, so colors, type and buttons stay consistent.</p></div>
                <div class="container"><h3>Can the embed break our site?</h3><p>No. Components render in isolation, so your site's CSS and theirs never collide.</p></div>
            </div>
        </div>`),
];

// ------------------------------------------------------------------ content

const blogPosts = [
    variant("cards", "Card grid", html`
        <div class="container spacing-large">
            <div class="container layout-split">
                <div class="container">
                    <p class="typography-accent">From the blog</p>
                    <h2>Latest articles</h2>
                </div>
                <p class="button-link"><a href="#blog">View all posts</a></p>
            </div>
            <div class="container layout-columns-3">
                <div class="container card" data-path-scope="3.blog.posts.*">
                    <figure class="image" data-path-src="3.blog.posts.*.cover"><img src="/marketing/blog/data-driven-pages.svg" alt="Article cover"></figure>
                    <p class="typography-accent">${v("3.blog.posts.*.category", "Category")}</p>
                    <h3 data-path-href="3.blog.posts.*.url"><a href="#">${v("3.blog.posts.*.title", "Title")}</a></h3>
                    <p>${v("3.blog.posts.*.excerpt", "Excerpt")}</p>
                    <p class="typography-small">${v("3.blog.posts.*.date", "Date")} · ${v("3.blog.posts.*.readTime", "Read time")}</p>
                </div>
            </div>
        </div>`),
];

const team = [
    variant("grid", "Avatar grid", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">Our team</p>
                <h2>The people building Acme</h2>
                <p class="typography-copy">Designers, engineers and writers who care about fast, beautiful pages.</p>
            </div>
            <div class="container layout-columns-3">
                <div class="container layout-center" data-path-scope="5.team.members.*">
                    <figure class="image" data-path-src="5.team.members.*.avatar"><img src="/marketing/avatars/maya-chen.svg" alt="Team member photo"></figure>
                    <h3>${v("5.team.members.*.name", "Name")}</h3>
                    <p class="typography-small">${v("5.team.members.*.role", "Role")}</p>
                </div>
            </div>
        </div>`),
];

const events = [
    variant("list", "Event list", html`
        <div class="container spacing-large">
            <div class="container layout-center">
                <p class="typography-accent">Events</p>
                <h2>Learn with the Acme community</h2>
            </div>
            <div class="container layout-columns-3">
                <div class="container card" data-path-scope="1.calendar.events.*">
                    <p class="typography-accent">${v("1.calendar.events.*.date", "Date")} · ${v("1.calendar.events.*.format", "Format")}</p>
                    <h3>${v("1.calendar.events.*.title", "Event")}</h3>
                    <p>${v("1.calendar.events.*.summary", "Summary")}</p>
                    <p class="typography-small">${v("1.calendar.events.*.time", "Time")}</p>
                    <p class="button-secondary" data-path-href="1.calendar.events.*.registerUrl" data-path-hidden="1.calendar.events.*.isSoldOut"><a href="#">Register</a></p>
                    <p class="typography-small" data-path-hidden="1.calendar.events.*.hasSeats"><strong>Sold out</strong></p>
                </div>
            </div>
        </div>`),
];

// ------------------------------------------------------------------ footers

const footer = [
    variant("columns", "Four columns", html`
        <div class="container spacing-regular">
            <div class="container layout-columns-4">
                <div class="container">
                    <h3>Acme</h3>
                    <p class="typography-small">Marketing pages your whole team can ship.</p>
                </div>
                <div class="container">
                    <p><strong>Product</strong></p>
                    <p><a href="#features">Features</a></p>
                    <p><a href="#pricing">Pricing</a></p>
                    <p><a href="#changelog">Changelog</a></p>
                </div>
                <div class="container">
                    <p><strong>Resources</strong></p>
                    <p><a href="#blog">Blog</a></p>
                    <p><a href="#docs">Documentation</a></p>
                    <p><a href="#events">Events</a></p>
                </div>
                <div class="container">
                    <p><strong>Company</strong></p>
                    <p><a href="#about">About</a></p>
                    <p><a href="#careers">Careers</a></p>
                    <p><a href="#contact">Contact</a></p>
                </div>
            </div>
            <hr>
            <p class="typography-small">© 2026 Acme, Inc. All rights reserved.</p>
        </div>`),
];

// ------------------------------------------------------------------ library

const component = (id: string, name: string, description: string, variants: ComponentVariant[], datasources: { id: number, name: string }[] = []) =>
    ({id, name, description, variants, datasources});

export const LIBRARY = [
    {
        id: "heroes",
        title: "Heroes",
        components: [
            component("hero", "Hero", "The first thing visitors see: a headline, a short pitch, buttons and a product shot.", hero),
        ],
    },
    {
        id: "social-proof",
        title: "Social proof",
        components: [
            component("logo-cloud", "Logo cloud", "A row of customer logos under a short line of text.", logoCloud),
            component("testimonials", "Testimonials", "Customer quotes with names, roles and photos, repeated from a data source.", testimonials, [{id: 2, name: "Customer stories"}]),
            component("stats", "Stats", "Four headline numbers on a tinted panel.", stats),
        ],
    },
    {
        id: "features",
        title: "Features",
        components: [
            component("feature-grid", "Feature grid", "A section intro followed by features in cards or with icons.", featureGrid),
            component("feature-highlight", "Feature highlight", "One feature in depth: text and a checklist beside a product shot.", featureHighlight),
        ],
    },
    {
        id: "conversion",
        title: "Conversion",
        components: [
            component("pricing", "Pricing", "Plan cards with prices, features and a call to action, repeated from pricing data.", pricing, [{id: 0, name: "Pricing plans"}]),
            component("call-to-action", "Call to action", "A closing prompt with primary and secondary buttons.", cta),
            component("faq", "FAQ", "Common questions and short answers in two columns.", faq),
        ],
    },
    {
        id: "content",
        title: "Content",
        components: [
            component("blog-posts", "Blog posts", "The latest articles as cards with covers and categories.", blogPosts, [{id: 3, name: "Blog posts"}]),
            component("team", "Team", "People on the team with photos and roles.", team, [{id: 5, name: "Team directory"}]),
            component("events", "Events", "Upcoming webinars and meetups, with registration or a sold-out label.", events, [{id: 1, name: "Upcoming events"}]),
        ],
    },
    {
        id: "footers",
        title: "Footers",
        components: [
            component("footer", "Footer", "Brand, link columns and the small print.", footer),
        ],
    },
];

export function seedVariants(componentId: string): ComponentVariant[] | null {
    for (const collection of LIBRARY) {
        const found = collection.components.find(c => c.id === componentId);
        if (found) return found.variants;
    }
    return null;
}
