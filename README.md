# React Server custom renderer

This has a few key differences to [react-markup](https://github.com/facebook/react/tree/main/packages/react-markup):

1. It does not have Suspense markup while still having support for Suspense
2. It does not encode styles with HTML entities, instead it replaces all double quotes with single quotes
    * This is not completely bullet-proof for all use cases, but for email client support this is the way
3. It can allow for rendering plugins that can do universal changes on the React element tree, such as a Tailwind one
