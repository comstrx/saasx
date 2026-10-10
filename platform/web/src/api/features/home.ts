import { get, many } from "../core/dsl.ts";
import { list } from "../core/fields.ts";
import { category } from "./categories.ts";
import { offer } from "./offers.ts";
import { product } from "./products.ts";

export default {
    offers: get("/home/recently-offers", list, many(offer), { cache: 60 }),
    categories: get("/home/recently-categories", list, many(category), { cache: 60 }),
    products: get("/home/recently-catalogs", list, many(product), { cache: 60 }),
};
