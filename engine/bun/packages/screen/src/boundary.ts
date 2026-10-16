import { Component, type ComponentType, type ReactNode } from "react";

export type BoundaryProps<P> = P & { name: string; children?: ReactNode };
export type BoundaryParts<P> = {
    report: ( name: string, error: unknown ) => void;
    fallback: ( props: BoundaryProps<P> & { reset: () => void } ) => ReactNode;
};

type Failed = { failed: boolean };

export function defineBoundary<P extends object> ({ report, fallback }: BoundaryParts<P>): ComponentType<BoundaryProps<P>> {

    return class Boundary extends Component<BoundaryProps<P>, Failed> {

        override state: Failed = { failed: false };

        static getDerivedStateFromError (): Failed {

            return { failed: true };

        }
        override componentDidCatch ( error: unknown ): void {

            report(this.props.name, error);

        }
        override render (): ReactNode {

            if ( !this.state.failed ) return this.props.children;

            return fallback({ ...this.props, reset: () => this.setState({ failed: false }) });

        }

    };

}
