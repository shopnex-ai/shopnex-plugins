export type WooProduct = {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    type: string;
    status: string;
    featured: boolean;
    catalog_visibility: string;
    description: string;
    short_description: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    date_on_sale_from: string | null;
    date_on_sale_from_gmt: string | null;
    date_on_sale_to: string | null;
    date_on_sale_to_gmt: string | null;
    on_sale: boolean;
    purchasable: boolean;
    total_sales: number;
    virtual: boolean;
    downloadable: boolean;
    downloads: Array<unknown>;
    download_limit: number;
    download_expiry: number;
    external_url: string;
    button_text: string;
    tax_status: string;
    tax_class: string;
    manage_stock: boolean;
    stock_quantity: number | null;
    backorders: string;
    backorders_allowed: boolean;
    backordered: boolean;
    low_stock_amount: number | null;
    sold_individually: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    shipping_required: boolean;
    shipping_taxable: boolean;
    shipping_class: string;
    shipping_class_id: number;
    reviews_allowed: boolean;
    average_rating: string;
    rating_count: number;
    upsell_ids: number[];
    cross_sell_ids: number[];
    parent_id: number;
    purchase_note: string;
    categories: Array<{
        id: number;
        name: string;
        slug: string;
    }>;
    brands: Array<unknown>;
    tags: Array<unknown>;
    images: Array<unknown>;
    attributes: Array<unknown>;
    default_attributes: Array<unknown>;
    variations: Array<unknown>;
    grouped_products: Array<unknown>;
    menu_order: number;
    price_html: string;
    related_ids: number[];
    meta_data: Array<unknown>;
    stock_status: string;
    has_options: boolean;
    post_password: string;
    global_unique_id: string;
    _links: {
        self: Array<{
            href: string;
            targetHints: {
                allow: string[];
            };
        }>;
        collection: Array<{
            href: string;
        }>;
    };
};

export type WooOrder = {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: string;
    date_modified: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    customer_id: number;
    order_key: string;
    billing: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        phone: string;
    };
    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    customer_ip_address: string;
    customer_user_agent: string;
    created_via: string;
    customer_note: string;
    date_completed: string | null;
    date_paid: string | null;
    cart_hash: string;
    number: string;
    meta_data: Array<{
        id: number;
        key: string;
        value: string;
    }>;
    line_items: Array<{
        id: number;
        name: string;
        product_id: number;
        variation_id: number;
        quantity: number;
        tax_class: string;
        subtotal: string;
        subtotal_tax: string;
        total: string;
        total_tax: string;
        taxes: Array<unknown>;
        meta_data: Array<{
            id: number;
            key: string;
            value: string;
            display_key: string;
            display_value: string;
        }>;
        sku: string;
        price: number;
        image: {
            id: number;
            src: string;
        };
        parent_name: string;
    }>;
    tax_lines: Array<unknown>;
    shipping_lines: Array<unknown>;
    fee_lines: Array<unknown>;
    coupon_lines: Array<unknown>;
    refunds: Array<unknown>;
    payment_url: string;
    is_editable: boolean;
    needs_payment: boolean;
    needs_processing: boolean;
    date_created_gmt: string;
    date_modified_gmt: string;
    date_completed_gmt: string | null;
    date_paid_gmt: string | null;
    currency_symbol: string;
    _links: {
        self: Array<{
            href: string;
            targetHints: {
                allow: string[];
            };
        }>;
        collection: Array<{
            href: string;
        }>;
        email_templates: Array<{
            embeddable: boolean;
            href: string;
        }>;
    };
};

export type WooCustomer = {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    username: string;
    billing: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        postcode: string;
        country: string;
        state: string;
        email: string;
        phone: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        company: string;
        address_1: string;
        address_2: string;
        city: string;
        postcode: string;
        country: string;
        state: string;
        phone: string;
    };
    is_paying_customer: boolean;
    avatar_url: string;
    meta_data: Array<{
        id: number;
        key: string;
        value: string;
    }>;
    _links: {
        self: Array<{
            href: string;
            targetHints: {
                allow: string[];
            };
        }>;
        collection: Array<{
            href: string;
        }>;
    };
};

export type WooResult<T> = {
    data: Array<T>;
    config: any;
    status: number;
    statusText: string;
    request: any;
    headers: any;
};

export type WooParams = {
    per_page?: number;
};

export type WooVariation = Array<{
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    description: string;
    permalink: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    date_on_sale_from: string | null;
    date_on_sale_from_gmt: string | null;
    date_on_sale_to: string | null;
    date_on_sale_to_gmt: string | null;
    on_sale: boolean;
    status: string;
    purchasable: boolean;
    virtual: boolean;
    downloadable: boolean;
    downloads: Array<any>;
    download_limit: number;
    download_expiry: number;
    tax_status: string;
    tax_class: string;
    manage_stock: boolean;
    stock_quantity: number | null;
    stock_status: string;
    backorders: string;
    backorders_allowed: boolean;
    backordered: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    shipping_class: string;
    shipping_class_id: number;
    image: {
        id: number;
        date_created: string;
        date_created_gmt: string;
        date_modified: string;
        date_modified_gmt: string;
        src: string;
        name: string;
        alt: string;
    };
    attributes: Array<{
        id: number;
        name: string;
        option: string;
    }>;
    menu_order: number;
    meta_data: Array<any>;
    _links: {
        self: Array<{
            href: string;
        }>;
        collection: Array<{
            href: string;
        }>;
        up: Array<{
            href: string;
        }>;
    };
}>;

export type WooTag = {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
    _links: {
        self: Array<{
            href: string;
        }>;
        collection: Array<{
            href: string;
        }>;
    };
};

export type WooCoupon = {
    id: number;
    code: string;
    amount: string;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    discount_type: string;
    description: string;
    date_expires: string | null;
    date_expires_gmt: string | null;
    usage_count: number;
    individual_use: boolean;
    product_ids: number[];
    excluded_product_ids: number[];
    usage_limit: number | null;
    usage_limit_per_user: number | null;
    limit_usage_to_x_items: number | null;
    free_shipping: boolean;
    product_categories: number[];
    excluded_product_categories: number[];
    exclude_sale_items: boolean;
    minimum_amount: string;
    maximum_amount: string;
    email_restrictions: string[];
    used_by: string[];
    meta_data: Array<unknown>;
    _links: {
        self: Array<{
            href: string;
        }>;
        collection: Array<{
            href: string;
        }>;
    };
};
