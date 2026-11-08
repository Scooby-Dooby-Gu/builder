// Sample data sources for the marketing components. Image paths are site-relative;
// the builder serves them, and embed.js resolves them against the Builder origin.
import {Datasource} from "models/datasource";

export const DATASOURCES: Datasource[] = [
    {
        id: "0",
        name: "Pricing plans",
        description: "Plans with prices, features and a call to action. One plan is marked as the most popular.",
        sample: {
            "pricing": {
                "currency": "USD",
                "plans": [
                    {
                        "name": "Starter",
                        "price": "$0",
                        "period": "per month",
                        "summary": "For trying things out and personal projects.",
                        "isStandard": true,
                        "ctaLabel": "Start for free",
                        "ctaUrl": "#signup",
                        "features": ["1 site", "10 published components", "Community support"]
                    },
                    {
                        "name": "Team",
                        "price": "$49",
                        "period": "per month",
                        "summary": "For marketing teams shipping pages every week.",
                        "isStandard": false,
                        "ctaLabel": "Start a free trial",
                        "ctaUrl": "#trial",
                        "features": ["5 sites", "Unlimited components", "Live data sources", "Themes and style guide", "Email support"]
                    },
                    {
                        "name": "Enterprise",
                        "price": "Custom",
                        "period": "billed annually",
                        "summary": "For organizations with many brands and teams.",
                        "isStandard": true,
                        "ctaLabel": "Talk to sales",
                        "ctaUrl": "#sales",
                        "features": ["Unlimited sites", "SSO and audit logs", "Custom data connectors", "Dedicated success manager"]
                    }
                ]
            }
        }
    },
    {
        id: "1",
        name: "Upcoming events",
        description: "Webinars and meetups with dates, formats and registration links.",
        sample: {
            "calendar": {
                "title": "Upcoming events",
                "events": [
                    {
                        "title": "Building data-driven landing pages",
                        "date": "Mar 12",
                        "time": "17:00 UTC",
                        "format": "Webinar",
                        "summary": "A live walkthrough of binding components to a product catalog.",
                        "registerUrl": "#register-landing-pages",
                        "isSoldOut": false,
                        "hasSeats": true
                    },
                    {
                        "title": "Design systems for marketing teams",
                        "date": "Mar 26",
                        "time": "16:00 UTC",
                        "format": "Panel",
                        "summary": "How three teams keep brand and speed in balance.",
                        "registerUrl": "#register-design-systems",
                        "isSoldOut": false,
                        "hasSeats": true
                    },
                    {
                        "title": "Acme meetup: London",
                        "date": "Apr 9",
                        "time": "18:30 BST",
                        "format": "In person",
                        "summary": "Talks, demos and drinks with the Acme community.",
                        "registerUrl": "#register-london",
                        "isSoldOut": true,
                        "hasSeats": false
                    }
                ]
            }
        }
    },
    {
        id: "2",
        name: "Customer stories",
        description: "Quotes from customers, with name, role, company and avatar.",
        sample: {
            "stories": {
                "items": [
                    {
                        "quote": "We went from a two-week handoff to launching campaign pages the same afternoon.",
                        "name": "Priya Raman",
                        "role": "Head of Growth",
                        "company": "Halcyon",
                        "avatar": "/marketing/avatars/priya-raman.svg"
                    },
                    {
                        "quote": "The style guide finally lives in one place, and every page picks it up automatically.",
                        "name": "Daniel Okafor",
                        "role": "Design Lead",
                        "company": "Brightpath",
                        "avatar": "/marketing/avatars/daniel-okafor.svg"
                    },
                    {
                        "quote": "Pricing changes used to need a deploy. Now marketing updates the data and it's live.",
                        "name": "Sofia Lindqvist",
                        "role": "VP Marketing",
                        "company": "Quanta",
                        "avatar": "/marketing/avatars/sofia-lindqvist.svg"
                    }
                ]
            }
        }
    },
    {
        id: "3",
        name: "Blog posts",
        description: "Recent articles with category, cover image, excerpt and link.",
        sample: {
            "blog": {
                "posts": [
                    {
                        "title": "Why your landing pages should read from data",
                        "category": "Guides",
                        "excerpt": "Hard-coded pages drift out of date. Here's how binding sections to a source keeps them current.",
                        "date": "Feb 28",
                        "readTime": "6 min read",
                        "cover": "/marketing/blog/data-driven-pages.svg",
                        "url": "#post-data-driven-pages"
                    },
                    {
                        "title": "Design tokens, explained for marketers",
                        "category": "Design",
                        "excerpt": "Colors, fonts and spacing as named building blocks, and why that makes rebrands painless.",
                        "date": "Feb 14",
                        "readTime": "5 min read",
                        "cover": "/marketing/blog/design-tokens.svg",
                        "url": "#post-design-tokens"
                    },
                    {
                        "title": "The launch-day checklist we actually use",
                        "category": "Playbooks",
                        "excerpt": "Twelve checks, from embed codes to analytics, that keep launches calm.",
                        "date": "Jan 30",
                        "readTime": "4 min read",
                        "cover": "/marketing/blog/launch-checklist.svg",
                        "url": "#post-launch-checklist"
                    }
                ]
            }
        }
    },
    {
        id: "5",
        name: "Team directory",
        description: "People on the team with roles, avatars and profile links.",
        sample: {
            "team": {
                "name": "Product & Engineering",
                "members": [
                    {"name": "Amara Nwosu", "role": "Head of Product", "avatar": "/marketing/avatars/amara-nwosu.svg", "profileUrl": "#amara-nwosu"},
                    {"name": "Maya Chen", "role": "Product Designer", "avatar": "/marketing/avatars/maya-chen.svg", "profileUrl": "#maya-chen"},
                    {"name": "Leo Martins", "role": "Software Engineer", "avatar": "/marketing/avatars/leo-martins.svg", "profileUrl": "#leo-martins"},
                    {"name": "Jonas Weber", "role": "Engineering Manager", "avatar": "/marketing/avatars/jonas-weber.svg", "profileUrl": "#jonas-weber"},
                    {"name": "Elena Rossi", "role": "Content Strategist", "avatar": "/marketing/avatars/elena-rossi.svg", "profileUrl": "#elena-rossi"},
                    {"name": "Kenji Tanaka", "role": "Developer Advocate", "avatar": "/marketing/avatars/kenji-tanaka.svg", "profileUrl": "#kenji-tanaka"}
                ]
            }
        }
    }
];
