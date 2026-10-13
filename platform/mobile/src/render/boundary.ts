import { Component, type ReactNode } from "react";

type Props = { name: string; children: ReactNode };
type State = { failed: boolean };

// biome-ignore lint/style/useReactFunctionComponents: an error boundary is a class by React's contract
export class Boundary extends Component<Props, State> {

    override state: State = { failed: false };

    static getDerivedStateFromError (): State {

        return { failed: true };

    }
    override render (): ReactNode {

        return this.state.failed ? null : this.props.children;

    }

}
