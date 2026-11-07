import { createSlice } from "@reduxjs/toolkit";
import { Datasource } from "models/datasource";


const initialState: Datasource[] = [
    {
        id: '0',
        name: 'Books & Bicycles Shop',
        description: 'Product catalog for a small shop: books with authors, reviews and tags, plus a bicycle parts section.',
        sample: {
            "store": {
                "name": "Books & Bicycle parts",
                "url": "http://b-and-b-shop.com",
                "books": [
                    {
                        "category": "Self-Help",
                        "author": {"url": "/author1", "name": "Nigel Rees"},
                        "title": "Sayings of the Century",
                        "description": "Nigel does it again, similar to his <a href=\"#\">Tales from the Crypto</a> series",
                        "image": "https://media.assets.sincrod.com/websites/content/gmps-selman//c4bce2ad65504ba6999e3786b21afdaa.png",
                        "book_url": "http://google.com",
                        "price": 8.95,
                        "isHidden": true,
                        "reviews": [
                            {"user": "Jesus",
                            "comment": "Good, better than the most"},
                            {"user": "Jane",
                            "comment": "Bad, just so bad"}
                        ],
                        "tags": [
                            "Not funny", 'cheap'
                        ]
                    },
                    {
                        "category": "Fiction",
                        "author": {"url": "/author2", "name": "Evelyn Waugh"},
                        "description": "Nice book about <strong>Dangers</strong> of conformism",
                        "title": "Sword of Honour",
                        "image": "https://cdn.pixabay.com/photo/2015/10/01/17/17/car-967387__340.png",
                        "href": "http://google.com",
                        "price": 12.99,
                        "isHidden": false,
                        "reviews": [
                            {"user": "Jack",
                            "comment": "Yes, this is interesting"},
                        ],
                        "tags": [
                            "big",
                            "hardback",
                            "ya"
                        ]
                    },
                    {
                        "category": "Documentary",
                        "author": {"url": "/author3", "name": "Yarik Fedin"},
                        "description": "Nice book about: <ul><li><strong>Dangers</strong></li><li>Safeties</li><li>etc</li></ul>",
                        "title": "Third book",
                        "image": "https://pics.clipartpng.com/Dark_Silver_Mercedes_Benz_Sl_2014_Car_PNG_Clipart-112.png",
                        "href": "http://google.com",
                        "price": 11.99,
                        "isHidden": true,
                        "reviews": [
                            {"user": "Jack",
                            "comment": "OK this book is pretty good"},
                            {"user": "Jill",
                            "comment": "Soso, didnt even <strong>read</strong>"},
                            {"user": "Joe",
                            "comment": "Best thing ever"}
                        ],
                        "tags": [
                            "a pamphlet",
                        ]
                    },
                ],
                "bicycle": {
                    "info": {
                        "details": "Bicycle parts are wholesale",
                        "address": "Good lord, NY"
                    },
                    "parts": ["Wheel", "Thing"]
                }
            }
        }
    },
    {
        id: '1',
        name: 'Events Calendar',
        description: 'Upcoming events with venues, speakers and ticket links.',
        sample: {
            "calendar": {
                "title": "Spring Events",
                "timezone": "America/New_York",
                "events": [
                    {
                        "title": "Design Systems Meetup",
                        "date": "2022-04-12",
                        "summary": "Talks on scaling component libraries across teams.",
                        "ticketUrl": "https://example.com/tickets/design-systems",
                        "price": 0,
                        "isSoldOut": false,
                        "venue": {"name": "Hall A", "city": "New York"},
                        "speakers": [
                            {"name": "Ana Ruiz", "role": "Design lead"},
                            {"name": "Tom Becker", "role": "Frontend engineer"}
                        ]
                    },
                    {
                        "title": "Headless CMS Workshop",
                        "date": "2022-05-03",
                        "summary": "Hands-on session wiring content APIs into page templates.",
                        "ticketUrl": "https://example.com/tickets/headless-cms",
                        "price": 49,
                        "isSoldOut": true,
                        "venue": {"name": "Studio 2", "city": "Boston"},
                        "speakers": [
                            {"name": "Priya Shah", "role": "Solutions architect"}
                        ]
                    }
                ]
            }
        }
    },
    {
        id: '5',
        name: 'Team Directory',
        description: 'People on the team with roles, locations and skills.',
        sample: {
            "team": {
                "name": "Product & Engineering",
                "members": [
                    {
                        "name": "Maya Chen",
                        "role": "Product designer",
                        "email": "maya@example.com",
                        "profileUrl": "/team/maya-chen",
                        "location": {"city": "Austin", "isRemote": true},
                        "skills": ["Prototyping", "Design systems"]
                    },
                    {
                        "name": "Leo Martins",
                        "role": "Software engineer",
                        "email": "leo@example.com",
                        "profileUrl": "/team/leo-martins",
                        "location": {"city": "Lisbon", "isRemote": false},
                        "skills": ["React", "GraphQL", "Testing"]
                    }
                ]
            }
        }
    }
]

export const datasourcesSlice = createSlice({
    name: 'datasources',
    initialState,
    reducers: {
    }
});

export default datasourcesSlice.reducer;