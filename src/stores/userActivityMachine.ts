/**
 * This state machine is a re-implementation of the useIdle hook from VueUse.
 * See https://github.com/vueuse/vueuse/blob/main/packages/core/useIdle/index.ts.
 */

import { assign, fromCallback, setup } from "xstate";

type WindowEventName = keyof WindowEventMap;

const defaultEvents: WindowEventName[] = [
  "mousemove",
  "mousedown",
  "resize",
  "keydown",
  "touchstart",
  "wheel",
];

function timestamp() {
  return Date.now();
}

const domEventListener = fromCallback<
  any,
  { listenForVisibilityChange: boolean; events: WindowEventName[] }
>(({ input, sendBack }) => {
  const windowEventMap = new Map<WindowEventName, () => void>();
  let documentVisibilitychangeHandler: (() => void) | undefined = undefined;

  for (const event of input.events) {
    function callback() {
      sendBack({
        type: "activity",
      });
    }

    windowEventMap.set(event, callback);

    window.addEventListener(event, callback, { passive: true });
  }

  if (input.listenForVisibilityChange === true) {
    documentVisibilitychangeHandler = () => {
      if (document.hidden === true) {
        return;
      }

      sendBack({
        type: "activity",
      });
    };

    document.addEventListener(
      "visibilitychange",
      documentVisibilitychangeHandler
    );
  }

  /**
   * That callback will be called when the service exits, that is, when the state that invoked it exits or
   * the overall state machine stops.
   */
  return () => {
    for (const [event, handler] of windowEventMap.entries()) {
      window.removeEventListener(event, handler);
    }

    if (documentVisibilitychangeHandler !== undefined) {
      document.removeEventListener(
        "visibilitychange",
        documentVisibilitychangeHandler
      );
    }
  };
});

export const userActivityMachine = setup({
  types: {
    events: {} as { type: "activity" },
    context: {} as {
      timeout: number;
      lastActive: number;
      listenForVisibilityChange: boolean;
      events: WindowEventName[];
    },
    input: {} as {
      /**
       * How long the user can stop interacting with the page before being considered inactive.
       *
       * @default 60_000 (1 minute)
       */
      timeout?: number;
      /**
       * @default true
       */
      listenForVisibilityChange?: boolean;
      /**
       * @default ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
       */
      events?: WindowEventName[];
    },
  },
  actors: {
    "Listen to DOM events": domEventListener,
  },
  delays: {
    /**
     * This is a dynamic timer. The `timeout` comes from the input and isn't expect to change.
     */
    "Inactivity timeout": ({ context }) => context.timeout,
  },
  actions: {
    "Assign last active timestamp to context": assign({
      lastActive: () => Date.now(),
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFVZgE4AICGBjALgJYBuh+AngHQCCBJYAxBAPYB2Yls+2+HqGOOqQo0hYANoAGALqJQAB2awyhNnJAAPRADYArAHZKkgEzbJAFl3aAHJO0BmAIz6ANCHKJjATi+VHx+y9HXXMvXV1HL3NzAF8Yt34sPCJhKloUjgBJCAAbRmSSMnIpWSQQRWUiNTKtBEczSj1raxCI7T19L3s3DwRve0p9SSdjYyt7IfNHWPiQRMEUotEMymy8hg0uHg5sADNedAAKTNYC1MwiAFswZgBXfABKBnmzpfT6VdyJGXUKlWrQLV6pJGrpmq16h0uj1PJIQZIQjZHNYvNYJpI0XEEmgkkI3mJKAARSC3eQ5Qi4HiEVhQDZbXiUPYHQ66SRPF54kTvYgcYkQUnkylEGklX5Kf6sdS1eyBSjWfSOSReBVg8yBZUwvrmbRy-QokwBRUTcz6LFzHELQoiE5nfKc4o-Mp-KqSmo6AxGUwWKy2BzOTXIkGWGxKlEy6zafxxWasZgQODqDmLChiyqqV2AxAAWmM5k1OZm2IEry5YlTEqlnjz7kQjkVfl0AXMcPsuh8DnsZqTVrSBLWYHLLsrCH0xk1ud0lERowsQQj9mMptm3dSyw+fIFFKpNMH6eH2sMSrr5makjrrbHNYQTkcRmmir9yJ8ji7FpLvZWhLYA6d4qHboQA8jCCaZT3PRsA2VSgTUbcIonaNovFfYt7VWU4y1-NMAU0RAvAcaCwRldsIiVcc62g+xQ2sCcxmMajoxiIA */
  id: "User activity",
  context: ({ input }) => ({
    timeout: input.timeout ?? 60_000,
    lastActive: timestamp(),
    listenForVisibilityChange: input.listenForVisibilityChange ?? true,
    events: input.events ?? defaultEvents,
  }),
  invoke: {
    src: "Listen to DOM events",
    input: ({ context }) => ({
      events: context.events,
      listenForVisibilityChange: context.listenForVisibilityChange,
    }),
  },
  initial: "Active",
  states: {
    Active: {
      initial: "Idle",
      states: {
        Idle: {
          after: {
            "Inactivity timeout": {
              target: "Done",
            },
          },
          on: {
            activity: {
              target: "Deduplicating",
              actions: "Assign last active timestamp to context",
            },
          },
        },
        Deduplicating: {
          after: {
            50: {
              target: "Idle",
            },
          },
        },
        Done: {
          type: "final",
        },
      },
      onDone: {
        target: "Inactive",
      },
    },
    Inactive: {
      on: {
        activity: {
          target: "Active",
          actions: "Assign last active timestamp to context",
        },
      },
    },
  },
});
