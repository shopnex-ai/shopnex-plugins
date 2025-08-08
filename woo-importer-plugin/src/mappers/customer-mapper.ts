import { Customer } from "@shopnex/types";
import { WooCustomer } from "../types";

export function mapWooCustomer(customer: WooCustomer): Omit<Customer, "id"> {
    return {
        name: `${customer.first_name} ${customer.last_name}`,
        issuerName: `WooCommerce`,
        username: customer.username,
        updatedAt: customer.date_modified,
        createdAt: customer.date_created,
        picture: customer.avatar_url,
    };
}
