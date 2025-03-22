"use client";

import { ClientComponentProps, ListQuery, PaginatedDocs, Where } from "payload";
import React, { useCallback, useEffect, useState } from "react";
import {
    Table,
    ListQueryProvider,
    DefaultListView,
    Pill,
    LoadingOverlay,
    Link,
} from "@payloadcms/ui";
import { useListQuery } from "@payloadcms/ui";
import "./index.scss";
import { stringify } from "qs-esm";

export function PluginListView(props: ClientComponentProps & { collectionSlug: string }) {
    const [data, setData] = useState<PaginatedDocs | null>(null);
    const { query } = useListQuery();

    const handleSearchChange = useCallback((data: ListQuery) => {
        fetchData(data);
    }, []);

    const fetchData = useCallback((query: ListQuery) => {
        const whereQuery: Where = {};

        if (query.search) {
            whereQuery.or = [{ title: { like: query.search } }];
        }

        if (query.where) {
            Object.assign(whereQuery, query.where);
        }

        const queryString = stringify(
            {
                where: whereQuery,
                limit: query.limit,
                page: query.page,
                sort: query.sort,
            },
            { addQueryPrefix: true },
        );

        fetch(`https://shopnex-studio.onrender.com/api/products${queryString}`, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setData(data);
            })
            .catch((error) => {
                console.error(error);
                setData(null);
            });
    }, []);

    useEffect(() => {
        fetchData(query);
    }, [query, fetchData]);

    if (!data) {
        return <LoadingOverlay />;
    }

    return (
        <ListQueryProvider onQueryChange={handleSearchChange} {...{ data }}>
            <DefaultListView
                {...props}
                Table={
                    <Table
                        columns={[
                            {
                                accessor: "name",
                                Heading: "Plugin Name",
                                renderedCells: data.docs?.map((element) => {
                                    return (
                                        <Link
                                            key={element.id}
                                            href={`${props.collectionSlug}/plugins/${element.id}`}
                                        >
                                            {element.title}
                                        </Link>
                                    );
                                }),
                                field: {
                                    name: "pluginName",
                                    type: "text",
                                },
                                active: true,
                            },
                            {
                                accessor: "pluginVersion",
                                Heading: "Plugin Version",
                                renderedCells: data.docs?.map((element) => {
                                    return <p key={element.id}>{element.pluginVersion}</p>;
                                }),
                                field: {
                                    name: "pluginVersion",
                                    type: "text",
                                },
                                active: true,
                            },
                        ]}
                        data={data?.docs}
                        key="table"
                    />
                }
            />
        </ListQueryProvider>
    );
}
