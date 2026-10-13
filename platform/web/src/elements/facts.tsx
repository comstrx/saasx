type Fact = { key: string; label: string; value: string };
type Props = { facts: readonly Fact[] };

export default function Facts ({ facts }: Props) {

    return (

        <dl className="facts">

            {facts.map(( fact ) => (

                <div key={fact.key} className="fact">

                    <dt className="fact-label">{fact.label}</dt>

                    <dd className="fact-value">{fact.value}</dd>

                </div>

            ))}

        </dl>

    );

}
