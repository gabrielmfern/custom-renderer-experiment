import ReactServer from "react-server";
import { propToHtmlAttribute } from "./attribute-processing/prop-to-html-attribute";

class Destination {
  html: string;
  decoder: TextDecoder;

  listeners: Array<
    [resolve: (value: string) => void, reject: (error: unknown) => void]
  >;

  constructor() {
    this.html = "";
    this.decoder = new TextDecoder("utf8", {
      fatal: true,
    });
    this.listeners = [];
  }

  write(content: string) {
    this.html += content;
  }

  writeEncoded(buffer: Uint8Array) {
    this.html += this.decoder.decode(buffer, { stream: true });
  }

  promise() {
    return new Promise<string>((resolve, reject) => {
      this.listeners.push([resolve, reject]);
    });
  }

  completeWithError(error: unknown) {
    this.listeners.forEach(([_, reject]) => reject(error));
  }

  complete() {
    this.listeners.forEach(([resolve]) => resolve(this.html));
  }
}

const encoder = new TextEncoder();

// Suspense boundaries are encoded as comments.
const startCompletedSuspenseBoundary = "<!--$-->";
const startPendingSuspenseBoundary1 = '<!--$?--><template id="';
const startPendingSuspenseBoundary2 = '"></template>';
const startClientRenderedSuspenseBoundary = "<!--$!-->";
const endSuspenseBoundary = "<!--/$-->";

const clientRenderedSuspenseBoundaryError1 = "<template";
const clientRenderedSuspenseBoundaryErrorAttrInterstitial = '"';
const clientRenderedSuspenseBoundaryError1A = ' data-dgst="';
const clientRenderedSuspenseBoundaryError1B = ' data-msg="';
const clientRenderedSuspenseBoundaryError1C = ' data-stck="';
const clientRenderedSuspenseBoundaryError1D = ' data-cstck="';
const clientRenderedSuspenseBoundaryError2 = "></template>";

const Renderer = ReactServer<Destination, null, null, null, number>({
  scheduleMicrotask(callback) {
    queueMicrotask(() => callback());
  },
  scheduleWork(callback) {
    callback();
  },
  beginWriting(destination) {},
  writeChunk(destination, buffer) {
    destination.writeEncoded(buffer);
  },
  writeChunkAndReturn(destination, buffer) {
    destination.writeEncoded(buffer);
    return true;
  },
  completeWriting(destination) {},
  close(destination) {
    destination.complete();
  },
  closeWithError(destination, error) {
    destination.completeWithError(error);
  },
  flushBuffered(destination) {},

  getChildFormatContext() {
    return null;
  },

  resetResumableState() {},
  completeResumableState() {},

  pushTextInstance(target, text, renderState, textEmbedded) {
    target.push(encoder.encode(text));
    return true;
  },
  pushStartInstance(target, type, props) {
    target.push(encoder.encode(`<${type}`));
    let dangerouslySetInnerHTML: { __html: string } | undefined = undefined;
    let children: React.ReactNode = undefined;
    for (const [name, value] of Object.entries(props)) {
      if (name === "children") {
        children = value;
        continue;
      } else if (name === "dangerouslySetInnerHTML") {
        dangerouslySetInnerHTML = value;
        continue;
      }
      target.push(encoder.encode(propToHtmlAttribute(name, value)));
    }
    target.push(encoder.encode(">"));

    if (dangerouslySetInnerHTML !== undefined) {
      if (children !== undefined) {
        throw new Error(
          "Can only set one of `children` or `props.dangerouslySetInnerHTML`.",
        );
      }
      if (
        typeof dangerouslySetInnerHTML !== "object" ||
        !("__html" in dangerouslySetInnerHTML)
      ) {
        throw new Error(
          "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. " +
            "Please visit https://react.dev/link/dangerously-set-inner-html " +
            "for more information.",
        );
      }
      const html = dangerouslySetInnerHTML.__html;
      if (html !== null && html !== undefined) {
        target.push(encoder.encode("" + html));
      }
    }

    if (
      typeof children === "string" ||
      typeof children === "number" ||
      typeof children === "boolean" ||
      typeof children === "bigint"
    ) {
      target.push(encoder.encode("" + children));
      return null;
    }
    return children;
  },

  pushEndInstance(target, type) {
    switch (type) {
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "img":
      case "input":
      case "keygen":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr": {
        return;
      }
    }
    target.push(encoder.encode(`</${type}>`));
  },

  // This is a noop in ReactNoop
  pushSegmentFinale(target, _, lastPushedText, textEmbedded) {
    if (lastPushedText && textEmbedded) {
      target.push(encoder.encode(`<!-- -->`));
    }
  },

  writeCompletedRoot() {
    return true;
  },

  writePlaceholder(destination, _, id) {
    destination.write(`<template id="`);
    destination.write(id.toString(16));
    destination.write(`></template>`);
    return true;
  },

  writeStartCompletedSuspenseBoundary(
    destination,
    renderState,
    suspenseInstance,
  ) {
    destination.write(startCompletedSuspenseBoundary);
    return true;
  },
  writeStartPendingSuspenseBoundary(
    destination,
    renderState,
    suspenseInstance,
  ): boolean {
    destination.write(startPendingSuspenseBoundary1);

    if (suspenseInstance === null) {
      throw new Error(
        "An ID must have been assigned before we can complete the boundary.",
      );
    }

    destination.write(suspenseInstance.toString(16));
    destination.write('"></template>');
    return true;
  },
  writeStartClientRenderedSuspenseBoundary(
    destination,
    _,
    errorDigest,
    errorMessage,
    errorStack,
    errorComponentStack,
  ) {
    destination.write("<!--$!-->");
    destination.write("<template");
    if (errorDigest) {
      destination.write(clientRenderedSuspenseBoundaryError1A);
      destination.write(errorDigest);
      destination.write(clientRenderedSuspenseBoundaryErrorAttrInterstitial);
    }
    if (errorMessage) {
      destination.write(clientRenderedSuspenseBoundaryError1B);
      destination.write(errorMessage);
      destination.write(clientRenderedSuspenseBoundaryErrorAttrInterstitial);
    }
    if (errorStack) {
      destination.write(clientRenderedSuspenseBoundaryError1C);
      destination.write(errorStack);
      destination.write(clientRenderedSuspenseBoundaryErrorAttrInterstitial);
    }
    if (errorComponentStack) {
      destination.write(clientRenderedSuspenseBoundaryError1D);
      destination.write(errorComponentStack);
      destination.write(clientRenderedSuspenseBoundaryErrorAttrInterstitial);
    }
    destination.write(clientRenderedSuspenseBoundaryError2);
    return true;
  },
  writeEndCompletedSuspenseBoundary(destination) {
    destination.write(endSuspenseBoundary);
    return true;
  },
  writeEndPendingSuspenseBoundary(destination) {
    destination.write(endSuspenseBoundary);
    return true;
  },
  writeEndClientRenderedSuspenseBoundary(destination) {
    destination.write(endSuspenseBoundary);
    return true;
  },

  writeStartSegment(destination, renderState, formatContext, id): boolean {
    return true;
  },
  writeEndSegment(destination: Destination, formatContext: null): boolean {
    return true;
  },

  writeCompletedSegmentInstruction(destination, renderState, contentSegmentID) {
    return true;
  },

  writeCompletedBoundaryInstruction(
    destination,
    renderState,
    boundary,
    contentSegmentID,
  ): boolean {
    return true;
  },

  writeClientRenderBoundaryInstruction(
    destination,
    renderState,
    boundary,
  ): boolean {
    return true;
  },

  writePreamble() {},
  writeHoistables() {},
  writeHoistablesForBoundary() {},
  writePostamble() {},
  hoistHoistables(parent, child) {},
  createHoistableState() {
    return null;
  },
  emitEarlyPreloads() {},
});

export function render(element: React.ReactElement) {
  const destination = new Destination();

  const request = Renderer.createRequest(element, null, null, null, undefined);
  Renderer.startWork(request);
  Renderer.startFlowing(request, destination);

  return destination.promise();
}
