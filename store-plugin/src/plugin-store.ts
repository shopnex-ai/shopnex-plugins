import type { CollectionConfig } from 'payload'

export const PluginStore: CollectionConfig = {
  slug: 'plugins-store',
  // access: {
  //   create: () => false,
  //   delete: () => false,
  //   read: () => true,
  //   update: () => false,
  // },
  admin: {
    defaultColumns: ['displayName', 'pluginVersion', 'pluginIcon'],
    group: 'Plugins',
    hideAPIURL: true,
    useAsTitle: 'displayName',
  },
  disableDuplicate: true,
  fields: [
    {
      name: 'pluginIcon',
      type: 'ui',

      admin: {
        components: {
          Cell: 'store-plugin/rsc#PluginIcon',
        },
      },
      label: '',
    },
    {
      name: 'pluginName',
      type: 'text',
      admin: {
        disabled: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'displayName',
          type: 'text',

          label: 'Plugin Name',
        },
        {
          name: 'pluginVersion',
          type: 'text',
        },
      ],
    },

    {
      name: 'pluginDescription',
      type: 'textarea',
      defaultValue:
        'A function that accepts req - PayloadRequest object which contains Web Request properties, currently authenticated user and the Local API instance payload.',
    },
    {
      name: 'test123',
      type: 'text',
      defaultValue: () => {
        return 'testing...'
      },
    },
    {
      name: 'test999',
      type: 'text',
      defaultValue: 'testing...,,',
    },
    {
      name: 'actions',
      type: 'ui',
      admin: {
        components: {
          // Cell: 'store-plugin/rsc#Actions',
          Field: 'store-plugin/rsc#Actions',
        },
      },
      custom: {
        test: 'me',
      },
    },
  ],
  labels: {
    plural: 'Plugins Store',
    singular: 'Plugin Store',
  },
}
