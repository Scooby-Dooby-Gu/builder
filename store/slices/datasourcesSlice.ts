import { createSlice } from "@reduxjs/toolkit";
import { Datasource } from "models/datasource";


const initialState: Datasource[] = [
    {
        id: '0',
        name: 'Books & Bicycles Shop',
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
    }
]

export const datasourcesSlice = createSlice({
    name: 'datasources',
    initialState,
    reducers: {
    }
});

export default datasourcesSlice.reducer;