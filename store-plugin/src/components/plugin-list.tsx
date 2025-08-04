"use client";

import { ClientComponentProps, ListQuery, PaginatedDocs, Where } from "payload";
import React, { useCallback, useEffect, useState } from "react";
import {
    Table,
    ListQueryProvider,
    DefaultListView,
    LoadingOverlay,
    Link,
} from "@payloadcms/ui";
import { useListQuery } from "@payloadcms/ui";
import "./index.scss";
import { stringify } from "qs-esm";
import "./plugin-list.scss";
import Image from "next/image";
import { Puzzle } from "lucide-react";
import { getPluginSpace } from "../actions/actions";

const baseClass = "plugin-list-view";

export function PluginListView(
    props: ClientComponentProps & { collectionSlug: string }
) {
    const [data, setData] = useState<PaginatedDocs | null>(null);
    const { query } = useListQuery();

    const handleSearchChange = useCallback((data: ListQuery) => {
        fetchData(data);
    }, []);

    const fetchData = useCallback(async (query: ListQuery) => {
        const whereQuery: Where = {
            shop: {},
        };

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
            { addQueryPrefix: true }
        );

        try {
            const data = await getPluginSpace(queryString);
            setData(data);
        } catch (error) {
            console.error(error);
            setData(null);
        }
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
                viewType="list"
                {...props}
                newDocumentURL=""
                hasCreatePermission={false}
                columnState={[]}
                collectionSlug={"plugins-space" as any}
                Table={
                    <Table
                        columns={[
                            {
                                accessor: "name",
                                CustomLabel: "Plugin Name",
                                Heading: "Plugin Name",
                                renderedCells: data.docs?.map((element) => {
                                    const imageUrl =
                                        element?.variants[0]?.gallery?.[0]?.url;
                                    return (
                                        <div
                                            key={element.id}
                                            className="list-item"
                                        >
                                            {imageUrl ? (
                                                <Image
                                                    className="list-item-icon"
                                                    width={60}
                                                    height={60}
                                                    src={imageUrl}
                                                    alt={element.title}
                                                />
                                            ) : (
                                                <Puzzle
                                                    className="list-item-icon"
                                                    width={40}
                                                    height={40}
                                                />
                                            )}

                                            <div>
                                                <Link
                                                    className="list-item-link"
                                                    href={`${props.collectionSlug}/plugins/${element.id}`}
                                                >
                                                    {element.title}
                                                </Link>
                                                <div className="list-item-author">
                                                    By{" "}
                                                    {element.authorName ||
                                                        "Unknown"}
                                                </div>
                                                <div className="list-item-price">
                                                    {element.variants[0]
                                                        ?.price === 0
                                                        ? "Free"
                                                        : `From $${element.variants[0]?.price}`}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }),
                                field: {
                                    name: "pluginName",
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
