"use client";

import { Component, type ReactNode } from "react";
import { reportError } from "@/lib/observe/browser";

type Props = { name: string; children: ReactNode };
type State = { failed: boolean };

export class Boundary extends Component<Props, State> {

    override state: State = { failed: false };

    static getDerivedStateFromError (): State {

        return { failed: true };

    }
    override componentDidCatch ( error: unknown ): void {

        reportError(error, { feature: this.props.name });

    }
    override render (): ReactNode {

        return this.state.failed ? null : this.props.children;

    }

}
