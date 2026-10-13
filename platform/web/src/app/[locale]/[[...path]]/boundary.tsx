"use client";

import { Component, type ReactNode } from "react";
import Notice from "@/elements/notice";
import { reportError } from "@/lib/observe/browser";

type Props = { name: string; message?: string | undefined; retry?: string | undefined; children: ReactNode };
type State = { failed: boolean };

/**
 * Catches a render failure below it: a feature boundary hides the feature, a screen boundary
 * shows the failure with a retry; either way the failure is reported.
 */
// biome-ignore lint/style/useReactFunctionComponents: an error boundary is a class by React's contract
export class Boundary extends Component<Props, State> {

    override state: State = { failed: false };

    static getDerivedStateFromError (): State {

        return { failed: true };

    }
    override componentDidCatch ( error: unknown ): void {

        reportError(this.props.name, error);

    }
    override render (): ReactNode {

        if ( !this.state.failed ) return this.props.children;
        if ( !this.props.message ) return null;

        return <Notice tone="failed" message={this.props.message} action={this.props.retry} onAction={() => this.setState({ failed: false })} />;

    }

}
