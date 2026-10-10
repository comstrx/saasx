import type { ReactNode } from "react";

type Props = { tabs?: ReactNode; stage?: ReactNode; body: ReactNode; actions?: ReactNode; dock?: ReactNode };

export default function Masthead ({ tabs, stage, body, actions, dock }: Props) {

    return (

        <section className="masthead">

            {tabs ? <div className="masthead-tabs">{tabs}</div> : null}

            <div className="masthead-panel">

                <div className="masthead-main">

                    {stage ? <div className="masthead-stage">{stage}</div> : null}

                    <div className="masthead-body">{body}</div>

                    {actions ? <div className="masthead-actions">{actions}</div> : null}

                </div>

            </div>

            {dock ? <div className="masthead-dock">{dock}</div> : null}

        </section>

    );

}
