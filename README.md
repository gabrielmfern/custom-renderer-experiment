# React Server custom renderer

This has three key differences to [react-markup](https://github.com/facebook/react/tree/main/packages/react-markup):

1. It does not have Suspense markup while still having support for Suspense
2. It does not encode styles with HTML entities, instead it replaces all double quotes with single quotes
    * This is not completely bullet-proof for all use cases, but for email client support this is the way
3. Being a completely custom render, it can allow for rendering plugins that can do universal changes on the React element tree, such as a Tailwind one

The key drawback to doing a custom renderer using react-server right now, is that `react-server` is not published
to npm, so it would also require some bundling to be done. Another small problem, that can be circumvented as well,
is that it only supports a set RC version, but we can use the older `react-server` and have a Host Config for that
other version as well.
