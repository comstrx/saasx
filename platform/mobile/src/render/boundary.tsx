import { Component, type ReactNode } from "react";
import Notice from "@/elements/notice";
import { reportError } from "@/lib/observe/client";
import type { Palette } from "@/styles/theme";

type Props = { name: string; message?: string | undefined; retry?: string | undefined; palette?: Palette | undefined; children: ReactNode };
type State = { failed: boolean };

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
        if ( !this.props.message || !this.props.palette ) return null;

        return <Notice tone="failed" message={this.props.message} action={this.props.retry} palette={this.props.palette} onAction={() => this.setState({ failed: false })} />;

    }
}
